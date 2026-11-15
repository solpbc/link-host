// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// `/p` — the pairing link's landing page. A phone lands here only when iOS /
// Android did NOT recognize the URL as belonging to an installed sol pbc app
// and handed it to the browser instead. A desktop always lands here: it has
// no universal link, so the page says how to hand the link to the solstone
// app on that computer. Strict CSP. No analytics, no cookies, no
// third-party scripts.
//
// UA detection is server-side via the request's `User-Agent` header. That
// header is in every HTTP request to any origin; we just use it once to
// pick which store CTA to lead with and then discard it. There is no
// inline JS by design — the CSP locks `script-src 'self'`, so any future
// client-side script would have to be served from this origin and would
// be verifiable in the public repo.
//
// Copy slots (H1, SUB, CTA_IOS, CTA_ANDROID, FOOTER) are brand-owned. The
// values below are the product placeholders sufficient for first deploy;
// the authoritative copy lives in the private product spec for this host,
// §literal copy. Brand iterates via PR + manual deploy.

import { t } from "./i18n";

const H1 = t("link.pair.finishpairingyourphonewithyourjournal");
const SUB = t("link.pair.youopenedapairinglinkbutsolstonemobile");
const CTA_IOS = t("link.pair.getsolstoneforiphone");
const CTA_ANDROID = t("link.pair.getsolstoneforandroid");
const FOOTER = t("link.pair.solpbcopensourcethispagecollectsnothing");

// A desktop has no app to hand the link to automatically, so the page asks
// for a paste. The link is this page's own address: the pairing secret sits
// in the fragment, which the browser keeps and never sends to this server.
const DESKTOP_H1 = t("link.pair.pairthiscomputerwithyourjournal");
const DESKTOP_SUB = t("link.pair.thispagesaddressisyourpairinglink");
const DESKTOP_OPEN_APP = t("link.pair.openinthesolstoneapp");
const DESKTOP_OPEN_APP_OR = t("link.pair.orpasteitinyourself");
const DESKTOP_LINUX = t("link.pair.onlinuxyoucanalsosaveitas");
const DESKTOP_LINUX_COMMAND =
	"systemctl --user stop solstone-linux\nsolstone-linux setup < pairing-link.txt\nsystemctl --user start solstone-linux";
const DESKTOP_EXPIRY = t("link.pair.thislinkworksonceandonlyfora");
const DESKTOP_GET_APP = t("link.pair.donthavethesolstoneapponthis");
const DESKTOP_GET_APP_LINK = t("link.pair.solstoneappinstall");
const DESKTOP_PHONE = t("link.pair.pairingaphoneinstead");
const INSTALL_URL = "https://solstone.app/install";

// Store URLs, the same listings solstone.app/mobile links. The App Store
// lists the app as "solstone mobile" under its numeric id; the Play Store
// URL uses the phone app's application ID.
const IOS_STORE_URL = "https://apps.apple.com/app/id6776850664";
const ANDROID_STORE_URL =
	"https://play.google.com/store/apps/details?id=app.solstone.observer.phone";

type Platform = "ios" | "android" | "chromeos" | "desktop";

function detectPlatform(userAgent: string): Platform {
	const ua = userAgent.toLowerCase();
	// iPhone, iPad, iPod — also matches Mac Catalyst running iOS UA in
	// some forms. We only need the install-CTA ordering to flip; an
	// imperfect match here just picks the wrong primary CTA, not a wrong
	// destination (both buttons are always shown).
	if (/iphone|ipad|ipod/.test(ua)) return "ios";
	if (/android/.test(ua)) return "android";
	// There is no solstone app for ChromeOS to open, so it gets the desktop
	// page without the open-in-app button.
	if (/cros/.test(ua)) return "chromeos";
	return "desktop";
}

export function renderLanding(userAgent: string): string {
	const platform = detectPlatform(userAgent);
	if (platform === "desktop" || platform === "chromeos")
		return renderDesktop(platform === "desktop");
	const iosFirst = platform !== "android";
	const iosButton = `<a class="cta cta-ios" href="${IOS_STORE_URL}">${CTA_IOS}</a>`;
	const androidButton = `<a class="cta cta-android" href="${ANDROID_STORE_URL}">${CTA_ANDROID}</a>`;
	const buttons = iosFirst
		? `${iosButton}\n\t\t\t${androidButton}`
		: `${androidButton}\n\t\t\t${iosButton}`;

	return page(
		t("link.pair.finishpairinggosolstoneapp"),
		`<h1>${H1}</h1>
		<p class="sub">${SUB}</p>
		<div class="ctas">
			${buttons}
		</div>`,
	);
}

// The store buttons stay on the desktop page, second: an iPad's Safari
// reports a desktop user agent, and an iPad without the app lands here.
function renderDesktop(offerOpenApp: boolean): string {
	// Mac, windows and linux get the open-in-app button; the script reveals it
	// only when the page carries a pairing fragment. The paste instructions stay
	// beside it, since a browser can't tell whether the app is installed.
	const openApp = offerOpenApp
		? `<div id="open-app-block" hidden>
			<div class="ctas"><a class="cta" id="open-app" href="#">${DESKTOP_OPEN_APP}</a></div>
			<p class="note">${DESKTOP_OPEN_APP_OR}</p>
		</div>
		`
		: "";
	return page(
		t("link.pair.pairadevicegosolstoneapp"),
		`<h1>${DESKTOP_H1}</h1>
		${openApp}<p class="sub">${DESKTOP_SUB}</p>
		<p class="note">${DESKTOP_LINUX}</p>
		<pre class="command">${DESKTOP_LINUX_COMMAND.replace("<", "&lt;")}</pre>
		<p class="note">${DESKTOP_EXPIRY}</p>
		<p class="note">${DESKTOP_GET_APP} <a href="${INSTALL_URL}">${DESKTOP_GET_APP_LINK}</a></p>
		<p class="note phone">${DESKTOP_PHONE}</p>
		<div class="ctas secondary">
			<a class="cta cta-ios" href="${IOS_STORE_URL}">${CTA_IOS}</a>
			<a class="cta cta-android" href="${ANDROID_STORE_URL}">${CTA_ANDROID}</a>
		</div>${offerOpenApp ? '\n\t\t<script src="/p.js" defer></script>' : ""}`,
	);
}

// The desktop page's only script, served from this origin. It points the
// "open in the solstone app" button at the solstone: link carrying the same
// fragment. The fragment, which holds the pairing secret, stays in the
// browser and never reaches this server. Without it the page is unchanged.
export const DESKTOP_SCRIPT = `(function () {
	var block = document.getElementById("open-app-block");
	var link = document.getElementById("open-app");
	if (!block || !link) return;
	function refresh() {
		var ready = location.hash.length > 1;
		if (ready) link.setAttribute("href", "solstone://pair" + location.hash);
		else link.removeAttribute("href");
		block.hidden = !ready;
		return ready;
	}
	refresh();
	window.addEventListener("hashchange", refresh);
	window.addEventListener("pageshow", refresh);
	link.addEventListener("click", function (event) {
		if (!refresh()) event.preventDefault();
	});
	link.addEventListener("auxclick", function (event) {
		if (!refresh()) event.preventDefault();
	});
	link.addEventListener("contextmenu", refresh);
})();
`;

function page(title: string, body: string): string {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${title}</title>
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
		[hidden] { display: none !important; }
		#open-app-block .note { margin-top: 0.75rem; }
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
		p.note {
			color: var(--muted);
			margin: 0 0 0.75rem;
			font-size: 0.9375rem;
		}
		p.note a { color: var(--fg); }
		p.phone { margin-top: 2rem; }
		pre.command {
			margin: 0 0 1rem;
			padding: 0.625rem 0.75rem;
			border: 1px solid var(--muted);
			border-radius: 0.375rem;
			font-size: 0.875rem;
			text-align: left;
			white-space: pre-wrap;
			word-break: break-all;
		}
		.ctas.secondary .cta:first-child {
			background: var(--cta-alt-bg);
			color: var(--cta-alt-fg);
			border: 1px solid var(--cta-alt-border);
		}
	</style>
</head>
<body>
	<main>
		${body}
		<footer>${FOOTER}</footer>
	</main>
</body>
</html>
`;
}
