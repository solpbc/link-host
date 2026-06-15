// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// `/p` — install-fallback landing page. Rendered only when iOS / Android
// did NOT recognize the URL as belonging to an installed sol pbc app and
// hands the URL to the browser instead. Strict CSP. No analytics, no
// cookies, no third-party scripts.
//
// UA detection is server-side via the request's `User-Agent` header. That
// header is in every HTTP request to any origin; we just use it once to
// pick which store CTA to lead with and then discard it. There is no
// inline JS by design — the CSP locks `script-src 'self'`, so any future
// client-side script would have to be served from this origin and would
// be verifiable in the public repo.
//
// Copy slots (H1, SUB, CTA_IOS, CTA_ANDROID, FOOTER) are CMO-owned. The
// values below are the CPO placeholders sufficient for first deploy. See
// `cpo/specs/in-flight/link-solpbc-org-host.md` §literal copy in the
// extro org. CMO iterates via PR + manual deploy.

const H1 = "finish pairing your phone with solstone.";
const SUB =
	"you scanned a pair code, but solstone mobile isn't installed yet. install it to finish.";
const CTA_IOS = "get solstone for iPhone";
const CTA_ANDROID = "get solstone for Android";
const FOOTER = "sol pbc · open source · this page collects nothing.";

// Store URLs. Bundle / package names are confirmed (`app.solstone.swift`
// for iOS, `app.solstone.android` for Android — CPO decision
// `260510-cpo-link-bundle-id-namespace-app-solstone-confirmed`), but the
// listings themselves don't exist yet — App Store listing follows the
// first iOS submission, Play Store listing follows Google Play developer
// enrollment + first Android build. The Play Store URL uses the confirmed
// package name and will resolve once the listing publishes; the iOS URL
// stays on the search-style `/app/solstone` slug until the App Store
// numeric id is minted on first submission.
const IOS_STORE_URL = "https://apps.apple.com/app/solstone";
const ANDROID_STORE_URL = "https://play.google.com/store/apps/details?id=app.solstone.android";

type Platform = "ios" | "android" | "other";

function detectPlatform(userAgent: string): Platform {
	const ua = userAgent.toLowerCase();
	// iPhone, iPad, iPod — also matches Mac Catalyst running iOS UA in
	// some forms. We only need the install-CTA ordering to flip; an
	// imperfect match here just picks the wrong primary CTA, not a wrong
	// destination (both buttons are always shown).
	if (/iphone|ipad|ipod/.test(ua)) return "ios";
	if (/android/.test(ua)) return "android";
	return "other";
}

export function renderLanding(userAgent: string): string {
	const platform = detectPlatform(userAgent);
	const iosFirst = platform !== "android";
	const iosButton = `<a class="cta cta-ios" href="${IOS_STORE_URL}">${CTA_IOS}</a>`;
	const androidButton = `<a class="cta cta-android" href="${ANDROID_STORE_URL}">${CTA_ANDROID}</a>`;
	const buttons = iosFirst
		? `${iosButton}\n\t\t\t${androidButton}`
		: `${androidButton}\n\t\t\t${iosButton}`;

	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>finish pairing — go.solstone.app</title>
	<meta name="robots" content="noindex, nofollow">
	<style>
		:root {
			--bg: #fbfaf6;
			--fg: #1a1a1a;
			--muted: #5a5a5a;
			--accent: #2b2b2b;
			--cta-bg: #1a1a1a;
			--cta-fg: #fbfaf6;
			--cta-alt-bg: #fbfaf6;
			--cta-alt-fg: #1a1a1a;
			--cta-alt-border: #1a1a1a;
		}
		@media (prefers-color-scheme: dark) {
			:root {
				--bg: #1a1a1a;
				--fg: #fbfaf6;
				--muted: #a0a0a0;
				--accent: #fbfaf6;
				--cta-bg: #fbfaf6;
				--cta-fg: #1a1a1a;
				--cta-alt-bg: #1a1a1a;
				--cta-alt-fg: #fbfaf6;
				--cta-alt-border: #fbfaf6;
			}
		}
		* { box-sizing: border-box; }
		html, body { margin: 0; padding: 0; }
		body {
			background: var(--bg);
			color: var(--fg);
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
			line-height: 1.45;
			-webkit-font-smoothing: antialiased;
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 2rem 1.25rem;
		}
		main {
			max-width: 28rem;
			width: 100%;
			text-align: center;
		}
		h1 {
			font-size: 1.5rem;
			line-height: 1.25;
			margin: 0 0 0.875rem;
			font-weight: 600;
			letter-spacing: -0.01em;
		}
		p.sub {
			color: var(--muted);
			margin: 0 0 2rem;
			font-size: 1rem;
		}
		.ctas { display: flex; flex-direction: column; gap: 0.75rem; }
		.cta {
			display: block;
			padding: 0.875rem 1rem;
			border-radius: 0.5rem;
			font-weight: 500;
			text-decoration: none;
			font-size: 1rem;
		}
		.cta:first-child {
			background: var(--cta-bg);
			color: var(--cta-fg);
			border: 1px solid var(--cta-bg);
		}
		.cta:nth-child(2) {
			background: var(--cta-alt-bg);
			color: var(--cta-alt-fg);
			border: 1px solid var(--cta-alt-border);
		}
		footer {
			margin-top: 2.5rem;
			color: var(--muted);
			font-size: 0.8125rem;
		}
		footer a { color: var(--muted); }
	</style>
</head>
<body>
	<main>
		<h1>${H1}</h1>
		<p class="sub">${SUB}</p>
		<div class="ctas">
			${buttons}
		</div>
		<footer>${FOOTER}</footer>
	</main>
</body>
</html>
`;
}
