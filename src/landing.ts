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

import { SOURCE_LOCALE, htmlLang, t } from "./i18n";

const DESKTOP_LINUX_COMMAND =
	"systemctl --user stop solstone-linux\nsolstone-linux setup < pairing-link.txt\nsystemctl --user start solstone-linux";
const INSTALL_URL = "https://solstone.app/install";

// Store URLs, the same listings solstone.app/mobile links. The App Store
// lists the app as "solstone.app" under its numeric id; the Play Store
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

export function renderLanding(userAgent: string, locale: string = SOURCE_LOCALE): string {
	const platform = detectPlatform(userAgent);
	if (platform === "desktop" || platform === "chromeos")
		return renderDesktop(platform === "desktop", locale);
	const iosFirst = platform !== "android";
	const iosButton = `<a class="cta cta-ios" href="${IOS_STORE_URL}">${t("link.pair.getsolstoneforiphone", locale)}</a>`;
	const androidButton = `<a class="cta cta-android" href="${ANDROID_STORE_URL}">${t("link.pair.getsolstoneforandroid", locale)}</a>`;
	const buttons = iosFirst
		? `${iosButton}\n\t\t\t${androidButton}`
		: `${androidButton}\n\t\t\t${iosButton}`;

	return page(
		t("link.pair.finishpairinggosolstoneapp", locale),
		`<h1>${t("link.pair.finishpairingyourphonewithyourjournal", locale)}</h1>
		<p class="sub">${t("link.pair.youopenedapairinglinkbutsolstonemobile", locale)}</p>
		<div class="ctas">
			${buttons}
		</div>`,
		locale,
	);
}

// The store buttons stay on the desktop page, second: an iPad's Safari
// reports a desktop user agent, and an iPad without the app lands here.
function renderDesktop(offerOpenApp: boolean, locale: string): string {
	// Mac, windows and linux get the open-in-app button; the script reveals it
	// only when the page carries a pairing fragment. The paste instructions stay
	// beside it, since a browser can't tell whether the app is installed.
	const openApp = offerOpenApp
		? `<div id="open-app-block" hidden>
			<div class="ctas"><a class="cta" id="open-app" href="#">${t("link.pair.openinthesolstoneapp", locale)}</a></div>
			<p class="note">${t("link.pair.orpasteitinyourself", locale)}</p>
		</div>
		`
		: "";
	return page(
		t("link.pair.pairadevicegosolstoneapp", locale),
		`<h1>${t("link.pair.pairthiscomputerwithyourjournal", locale)}</h1>
		${openApp}<p class="sub">${t("link.pair.thispagesaddressisyourpairinglink", locale)}</p>
		<p class="note">${t("link.pair.onlinuxyoucanalsosaveitas", locale)}</p>
		<pre class="command">${DESKTOP_LINUX_COMMAND.replace("<", "&lt;")}</pre>
		<p class="note">${t("link.pair.thislinkworksonceandonlyfora", locale)}</p>
		<p class="note">${t("link.pair.donthavethesolstoneapponthis", locale)} <a href="${INSTALL_URL}">${t("link.pair.solstoneappinstall", locale)}</a></p>
		<p class="note phone">${t("link.pair.pairingaphoneinstead", locale)}</p>
		<div class="ctas secondary">
			<a class="cta cta-ios" href="${IOS_STORE_URL}">${t("link.pair.getsolstoneforiphone", locale)}</a>
			<a class="cta cta-android" href="${ANDROID_STORE_URL}">${t("link.pair.getsolstoneforandroid", locale)}</a>
		</div>${offerOpenApp ? '\n\t\t<script src="/p.js" defer></script>' : ""}`,
		locale,
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

function page(title: string, body: string, locale: string): string {
	return `<!doctype html>
<html lang="${htmlLang(locale)}">
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
		<footer>${t("link.pair.solpbcopensourcethispagecollectsnothing", locale)}</footer>
	</main>
</body>
</html>
`;
}
