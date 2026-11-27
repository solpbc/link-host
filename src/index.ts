// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// Entry point for the link-host Worker — sol pbc's universal native-app
// handoff surfaces dispatched on request host.
//
// Routes:
//   go.solstone.app (solstone universal-link surface):
//     GET  /.well-known/apple-app-site-association  →  solstone AASA
//     GET  /.well-known/assetlinks.json             →  solstone assetlinks
//     GET  /p                                       →  solstone install-fallback
//     GET  /p.js                                    →  the desktop page's open-in-app script
//   link.solpbc.org (extro surface):
//     GET  /.well-known/apple-app-site-association  →  extro AASA
//     GET  /x/sync                                  →  extro install-fallback
//   both hosts:
//     GET  /                                        →  bare host page (host-derived), noindex
//     GET  /robots.txt                              →  disallow /p, /x; allow / and /.well-known/
//     *    *                                        →  404
//     POST/PUT/DELETE/PATCH *                       →  405
//
// Privacy invariants enforced by this Worker:
//   - No cookies set, anywhere.
//   - No analytics, no third-party scripts in served content.
//   - Strict CSP on HTML responses; `connect-src 'none'` blocks scripted
//     connection APIs. The only JavaScript is the desktop page's same-origin
//     open-in-app script, which reads the fragment and makes no requests.
//   - The URL fragment is processed client-side per RFC 3986 and never enters
//     the HTTP request, independently of platform logging configuration.
//   - `wrangler.toml` turns Workers Logs off, invocation events included. This
//     source emits no application logs.
//
// See the private product spec for this host for
// the full design.

import { EXTRO_AASA, SOLSTONE_AASA } from "./aasa";
import { ASSETLINKS } from "./assetlinks";
import { PACKAGED_LOCALES, resolveLocale, t } from "./i18n";
import { renderIndex } from "./index-page";
import { JOURNAL_SCRIPT, renderJournal } from "./journal";
import { JOURNAL_ASSETS } from "./journal-assets";
import { DESKTOP_SCRIPT, renderGarmin, renderLanding } from "./landing";
import { renderExtroSync } from "./landing-extro";
import { ROBOTS } from "./robots";

type HostKind = "solstone" | "extro" | "unknown";

function hostKind(hostname: string): HostKind {
	if (hostname === "go.solstone.app") return "solstone";
	if (hostname === "link.solpbc.org") return "extro";
	return "unknown";
}

// CSP for HTML responses. Locked per spec:
// - `connect-src 'none'` — blocks scripted connection APIs.
// - `style-src 'self' 'unsafe-inline'` — we inline our CSS so the page
//   renders without a separate request; the inline content is verifiable
//   in the public repo. No third-party stylesheets.
// - `script-src 'self'` — no inline scripts; any future script would be
//   served from this origin and visible in the repo.
// - `frame-ancestors 'none'` — never embed this in another site.
// - `img-src 'self'` — no third-party images. Today the pages use no
//   images at all; the directive sets the ceiling for future copy
//   iterations.
const HTML_CSP =
	"default-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

const COMMON_SECURITY_HEADERS: HeadersInit = {
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "no-referrer",
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	"X-Frame-Options": "DENY",
	"Permissions-Policy": "interest-cohort=(), browsing-topics=()",
};

function htmlResponse(body: string, status = 200, extraHeaders: HeadersInit = {}): Response {
	return new Response(body, {
		status,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Content-Security-Policy": HTML_CSP,
			"Cache-Control": "public, max-age=300",
			...COMMON_SECURITY_HEADERS,
			...extraHeaders,
		},
	});
}

function jsonResponse(body: unknown, status = 200): Response {
	// AASA + assetlinks MUST be `application/json` with no redirects and a
	// caching window long enough to survive Apple's polling — 1 hour per
	// spec. Apple aggressively caches AASA on first install; misconfigured
	// caching here can brick the handoff for hours. See spec §technical
	// approach for the rationale.
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600",
			...COMMON_SECURITY_HEADERS,
		},
	});
}

function textResponse(body: string, status = 200): Response {
	return new Response(body, {
		status,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
			...COMMON_SECURITY_HEADERS,
		},
	});
}

function methodNotAllowed(locale: string): Response {
	// 405 must include an Allow header per RFC 7231 §6.5.5.
	return new Response(t("link.http.methodnotallowed", locale), {
		status: 405,
		headers: {
			Allow: "GET, HEAD",
			"Content-Type": "text/plain; charset=utf-8",
			...COMMON_SECURITY_HEADERS,
		},
	});
}

function notFound(locale: string): Response {
	return new Response(t("link.http.notfound", locale), {
		status: 404,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			...COMMON_SECURITY_HEADERS,
		},
	});
}

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const method = request.method.toUpperCase();
		const locale = resolveLocale(request.headers.get("Accept-Language"));
		const varyLocale = PACKAGED_LOCALES.length > 1;

		// Reject body-bearing / mutating methods up front. HEAD is allowed
		// implicitly by passing through to GET handling; CF Workers handle
		// HEAD by stripping the body from the GET response.
		if (method !== "GET" && method !== "HEAD") {
			return methodNotAllowed(locale);
		}

		const host = url.hostname;
		const kind = hostKind(host);

		// AASA — Apple Universal Links manifest. No redirects (Apple rejects
		// redirected AASA). Exact MIME `application/json`.
		if (url.pathname === "/.well-known/apple-app-site-association") {
			if (kind === "solstone") return jsonResponse(SOLSTONE_AASA);
			if (kind === "extro") return jsonResponse(EXTRO_AASA);
			return notFound(locale);
		}

		// Android assetlinks — App Links verification manifest.
		if (url.pathname === "/.well-known/assetlinks.json") {
			if (kind === "solstone") return jsonResponse(ASSETLINKS);
			return notFound(locale);
		}

		// Install-fallback page. Only reached when iOS / Android did NOT
		// match the URL against an installed sol pbc app. UA detection is
		// server-side; we use it once to pick the primary CTA, then the
		// header is gone.
		if (url.pathname === "/p" || url.pathname === "/j") {
			if (kind !== "solstone") return notFound(locale);
			const ua = request.headers.get("User-Agent") ?? "";
			return htmlResponse(
				url.pathname === "/j" ? renderJournal(ua, locale) : renderLanding(ua, locale),
				200,
				{
					Vary: varyLocale ? "User-Agent, Accept-Language" : "User-Agent",
				},
			);
		}

		// Garmin watch companion setup fallback page. Only reached when Android
		// did not open an installed solstone phone app via verified App Links.
		if (url.pathname === "/garmin") {
			if (kind !== "solstone") return notFound(locale);
			return htmlResponse(renderGarmin(locale), 200, varyLocale ? { Vary: "Accept-Language" } : {});
		}

		// The desktop landing page's one script (see `DESKTOP_SCRIPT`).
		if (url.pathname === "/p.js" || url.pathname === "/j.js") {
			if (kind !== "solstone") return notFound(locale);
			return new Response(url.pathname === "/j.js" ? JOURNAL_SCRIPT : DESKTOP_SCRIPT, {
				status: 200,
				headers: {
					"Content-Type": "text/javascript; charset=utf-8",
					"Cache-Control": "public, max-age=300",
					...COMMON_SECURITY_HEADERS,
				},
			});
		}

		const asset = Object.hasOwn(JOURNAL_ASSETS, url.pathname)
			? JOURNAL_ASSETS[url.pathname]
			: undefined;
		if (asset && kind === "solstone") {
			return new Response(
				Uint8Array.from(atob(asset.base64), (c) => c.charCodeAt(0)),
				{
					headers: {
						"Content-Type": asset.type,
						"Cache-Control": "public, max-age=300",
						...COMMON_SECURITY_HEADERS,
					},
				},
			);
		}

		// Extro install-fallback page. Only reached when iOS did NOT match
		// the URL against an installed extro-mobile app.
		if (url.pathname === "/x/sync") {
			if (kind !== "extro") return notFound(locale);
			return htmlResponse(
				renderExtroSync(locale),
				200,
				varyLocale ? { Vary: "Accept-Language" } : {},
			);
		}

		// Crawlable so a Disallow can never lock in a stale index entry, but
		// tagged noindex — this host has nothing worth ranking, per the CMO
		// indexability policy's tier-4 assignment for these hosts.
		if (url.pathname === "/") {
			return htmlResponse(renderIndex(host, locale), 200, {
				"X-Robots-Tag": "noindex",
				...(varyLocale ? { Vary: "Accept-Language" } : {}),
			});
		}

		if (url.pathname === "/robots.txt") {
			return textResponse(ROBOTS);
		}

		return notFound(locale);
	},
} satisfies ExportedHandler;
