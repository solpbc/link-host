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
//   link.solpbc.org (extro surface):
//     GET  /.well-known/apple-app-site-association  →  extro AASA
//     GET  /x/sync                                  →  extro install-fallback
//   both hosts:
//     GET  /                                        →  bare host page (host-derived)
//     GET  /robots.txt                              →  robots.txt
//     *    *                                        →  404
//     POST/PUT/DELETE/PATCH *                       →  405
//
// Privacy invariants enforced by this Worker:
//   - No cookies set, anywhere.
//   - No analytics, no third-party scripts in served content.
//   - Strict CSP on HTML responses; `connect-src 'none'` so any future
//     client-side script cannot beacon out.
//   - The URL fragment is processed client-side per RFC 3986 and never enters
//     the HTTP request, independently of platform logging configuration.
//   - `wrangler.toml` disables Cloudflare's built-in invocation events. This
//     source emits no application logs; Workers Logs stays available for
//     deliberate operational error output.
//
// See the private product spec for this host for
// the full design.

import { EXTRO_AASA, SOLSTONE_AASA } from "./aasa";
import { ASSETLINKS } from "./assetlinks";
import { renderIndex } from "./index-page";
import { renderLanding } from "./landing";
import { renderExtroSync } from "./landing-extro";
import { ROBOTS } from "./robots";

type HostKind = "solstone" | "extro" | "unknown";

function hostKind(hostname: string): HostKind {
	if (hostname === "go.solstone.app") return "solstone";
	if (hostname === "link.solpbc.org") return "extro";
	return "unknown";
}

// CSP for HTML responses. Locked per spec:
// - `connect-src 'none'` — makes accidental beaconing impossible.
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

function htmlResponse(body: string, status = 200): Response {
	return new Response(body, {
		status,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Content-Security-Policy": HTML_CSP,
			"Cache-Control": "public, max-age=300",
			...COMMON_SECURITY_HEADERS,
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

function methodNotAllowed(): Response {
	// 405 must include an Allow header per RFC 7231 §6.5.5.
	return new Response("method not allowed", {
		status: 405,
		headers: {
			Allow: "GET, HEAD",
			"Content-Type": "text/plain; charset=utf-8",
			...COMMON_SECURITY_HEADERS,
		},
	});
}

function notFound(): Response {
	return new Response("not found", {
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

		// Reject body-bearing / mutating methods up front. HEAD is allowed
		// implicitly by passing through to GET handling; CF Workers handle
		// HEAD by stripping the body from the GET response.
		if (method !== "GET" && method !== "HEAD") {
			return methodNotAllowed();
		}

		const host = url.hostname;
		const kind = hostKind(host);

		// AASA — Apple Universal Links manifest. No redirects (Apple rejects
		// redirected AASA). Exact MIME `application/json`.
		if (url.pathname === "/.well-known/apple-app-site-association") {
			if (kind === "solstone") return jsonResponse(SOLSTONE_AASA);
			if (kind === "extro") return jsonResponse(EXTRO_AASA);
			return notFound();
		}

		// Android assetlinks — App Links verification manifest.
		if (url.pathname === "/.well-known/assetlinks.json") {
			if (kind === "solstone") return jsonResponse(ASSETLINKS);
			return notFound();
		}

		// Install-fallback page. Only reached when iOS / Android did NOT
		// match the URL against an installed sol pbc app. UA detection is
		// server-side; we use it once to pick the primary CTA, then the
		// header is gone.
		if (url.pathname === "/p") {
			if (kind !== "solstone") return notFound();
			const ua = request.headers.get("User-Agent") ?? "";
			return htmlResponse(renderLanding(ua));
		}

		// Extro install-fallback page. Only reached when iOS did NOT match
		// the URL against an installed extro-mobile app.
		if (url.pathname === "/x/sync") {
			if (kind !== "extro") return notFound();
			return htmlResponse(renderExtroSync());
		}

		if (url.pathname === "/") {
			return htmlResponse(renderIndex(host));
		}

		if (url.pathname === "/robots.txt") {
			return textResponse(ROBOTS);
		}

		return notFound();
	},
} satisfies ExportedHandler;
