// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

import { SOURCE_LOCALE, htmlLang, t } from "./i18n";
import { JOURNAL_TOKENS } from "./journal-tokens";

export function renderJournal(userAgent: string, locale: string = SOURCE_LOCALE): string {
	const android = /android/i.test(userAgent);
	const supported = android || /iphone|ipad|ipod|macintosh|windows|linux/i.test(userAgent);
	// Claude desktop's built-in browser pane names itself in its user agent and
	// refuses every non-web link, so the app button can never work there.
	const pane = / Claude\/\d/.test(userAgent);
	const target = pane
		? "copy"
		: /cros/i.test(userAgent) || !supported
			? ""
			: android
				? "android"
				: "scheme";
	// Desktop Chromium- and Firefox-family browsers remember an origin-scoped
	// "Always allow" choice for custom schemes, so an opt-in browser-local
	// auto-open toggle works cleanly there. Safari (macOS/iPadOS) and iOS have
	// no persistent custom-scheme allowlist and claim /j via Universal Links.
	const mobileApple = /iphone|ipad|ipod/i.test(userAgent);
	const safari =
		/safari/i.test(userAgent) && !/chrome|chromium|crios|edg|firefox|fxios|opr/i.test(userAgent);
	const autoOpen = target === "scheme" && !mobileApple && !safari;
	const autoOpenControl = autoOpen
		? `\n<label class="auto-open" id="auto-open-label" hidden><input type="checkbox" id="auto-open"><span>${t("link.journal.autoopen", locale)}</span></label>`
		: "";
	const handoff = pane
		? `<p class="intro">${t("link.journal.panebody", locale)}</p>
<button class="primary" id="copy-link" type="button" data-copied="${t("link.journal.copied", locale)}">${t("link.journal.copylink", locale)}</button>
<p class="copied" id="copied" role="status" data-text="${t("link.journal.pastehint", locale)}"></p>`
		: `<p class="intro">${t("link.journal.body", locale)}</p>
<a class="primary" id="open-app">${t("link.journal.open", locale)}</a>${autoOpenControl}
<section class="recovery"><h2>${t("link.journal.fallbacktitle", locale)}</h2><p>${t("link.journal.fallbackbody", locale)}</p></section>`;
	return `<!doctype html>
<html lang="${htmlLang(locale)}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="light dark">
<title>${t("link.journal.title", locale)}</title>
<style>${JOURNAL_TOKENS}
*{box-sizing:border-box}[hidden]{display:none!important}
body{margin:0;background:var(--cream-bright);color:var(--ink);font-family:var(--font-body);font-size:16px;line-height:1.55}
.stage{min-height:100dvh;padding:clamp(40px,9vh,100px) 24px 32px;display:flex;flex-direction:column;align-items:center}
main,footer{width:100%;max-width:448px}
h1{font-family:var(--font-display);font-weight:700;font-size:28px;line-height:1.35;letter-spacing:-.02em;margin:0 0 16px}
h2,summary{font-size:16px;font-weight:600;line-height:1.5}h2{margin:0 0 6px}p{margin:0 0 20px}
.intro{color:var(--ink-soft);font-size:17px;line-height:1.6;margin-bottom:28px}
.primary{display:flex;align-items:center;justify-content:center;min-height:52px;padding:12px 18px;border-radius:var(--radius-sm);background:var(--ink);color:var(--paper);text-decoration:none;font-weight:600;text-align:center}
button.primary{width:100%;border:0;font:inherit;font-weight:600;cursor:pointer}.copied{margin:16px 0 0;color:var(--ink-soft)}.copied:empty{display:none}.primary:hover{opacity:.88}.auto-open{display:flex;align-items:center;gap:10px;min-height:44px;margin:14px 0 0;color:var(--ink-soft);font-size:15px;line-height:1.45;cursor:pointer}.auto-open input{width:18px;height:18px;margin:0;flex:0 0 auto;accent-color:var(--ink);cursor:pointer}.auto-open input:focus-visible{outline:3px solid var(--orange-ink);outline-offset:3px}.recovery{margin:32px 0 0}.recovery p{margin-bottom:0;color:var(--ink-soft)}
details{margin-top:24px;padding-top:20px;border-top:1px solid var(--hairline)}summary{min-height:44px;padding:8px 0;cursor:pointer}
details p{margin:10px 0 20px;color:var(--ink-soft)}a{color:inherit;text-underline-offset:3px}
a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid var(--orange-ink);outline-offset:4px}
.badges{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin:18px 0 16px}.badges a{display:flex;align-items:center;min-height:48px}.badges img{height:40px;width:auto;max-width:100%}
.install-link{display:inline-block;min-height:44px;padding:8px 0}.attribution{font-size:12px;line-height:1.6;margin-top:20px}
footer{font-size:12px;margin-top:48px;color:var(--ink-soft)}
@media(prefers-color-scheme:dark){:root{--cream-bright:#1A1A1A;--paper:#242424;--ink:#FCF3E4;--ink-soft:#C9C1B5;--hairline:#544F47}.primary{color:#1A1A1A}}
@media(max-width:500px){h1{font-size:26px}.stage{padding:40px 24px 28px}.badges{gap:12px}}
</style></head><body><div class="stage">
<main data-target="${target}">
<section id="ready" hidden>
<h1>${t("link.journal.title", locale)}</h1>${handoff}
<details><summary>${t("link.journal.installtitle", locale)}</summary><p>${t("link.journal.installbody", locale)}</p>
<div class="badges">
<a href="https://apps.apple.com/app/id6776850664"><img src="/j-assets/badge-app-store.svg" alt="${t("link.journal.applebadge", locale)}" height="40"></a>
<a href="https://play.google.com/store/apps/details?id=app.solstone.observer.phone"><img src="/j-assets/badge-google-play.png" alt="${t("link.journal.googlebadge", locale)}" height="40"></a>
</div><a class="install-link" href="https://solstone.app/install">${t("link.journal.installdesktop", locale)}</a>
<p class="attribution">${t("link.journal.attribution", locale)}</p></details>
</section>
<section id="missing"><h1>${t("link.journal.missing", locale)}</h1><p>${t("link.journal.copyagain", locale)}</p></section>
<section id="invalid" hidden><h1>${t("link.journal.invalid", locale)}</h1><p>${t("link.journal.copyagain", locale)}</p></section>
</main><footer><a href="https://github.com/solpbc/link-host">${t("link.journal.footer", locale)}</a></footer>
</div><script src="/j.js" defer></script></body></html>`;
}

// Only reads the browser's fragment. Never decode, re-encode or transmit it.
// Inside Claude's pane the page copies the link to the owner's clipboard on
// their click; it still makes no requests. On supported desktop browsers, an
// opt-in browser-local preference stores only "1" (never a token) so repeat
// visits open the solstone app without another click.
export const JOURNAL_SCRIPT = `(function () {
	var AUTO_KEY = "solstone.journal.auto_open";
	var main = document.querySelector("main");
	var link = document.getElementById("open-app");
	var autoLabel = document.getElementById("auto-open-label");
	var autoBox = document.getElementById("auto-open");
	var copy = document.getElementById("copy-link");
	var copied = document.getElementById("copied");
	var copyLabel = copy ? copy.textContent : "";
	var ready = document.getElementById("ready");
	var missing = document.getElementById("missing");
	var invalid = document.getElementById("invalid");
	var storage = null;
	var lastAutoToken = "";
	function readAutoOpen() {
		if (!storage) return false;
		try {
			return storage.getItem(AUTO_KEY) === "1";
		} catch (e) {
			return false;
		}
	}
	if (autoBox && autoLabel) {
		try {
			var s = window.localStorage;
			if (s) {
				autoBox.checked = s.getItem(AUTO_KEY) === "1";
				storage = s;
				autoLabel.hidden = false;
			}
		} catch (e) {}
	}
	function currentDestination() {
		var token = location.hash.slice(1);
		var valid = /^[A-Za-z0-9_-]{1,512}(~[0-9]{6})?$/.test(token);
		var target = main.getAttribute("data-target");
		return {
			token: token,
			valid: valid,
			target: target,
			href: valid && target
				? (target === "android"
					? "intent://go.solstone.app/j#" + token + "#Intent;scheme=https;package=app.solstone.observer.phone;end"
					: "solstone://open#" + token)
				: ""
		};
	}
	function refresh() {
		var state = currentDestination();
		ready.hidden = !state.valid;
		missing.hidden = state.token.length !== 0;
		invalid.hidden = !state.token || state.valid;
		if (link) {
			link.hidden = !state.href;
			if (state.href) link.setAttribute("href", state.href);
			else link.removeAttribute("href");
		}
		document.title = (state.valid ? ready : state.token ? invalid : missing).querySelector("h1").textContent;
		return Boolean(state.href);
	}
	function isBackForward() {
		try {
			var perf = window.performance;
			var entries = perf && perf.getEntriesByType ? perf.getEntriesByType("navigation") : null;
			return Boolean(entries && entries[0] && entries[0].type === "back_forward");
		} catch (e) {
			return false;
		}
	}
	function maybeAutoOpen(initial) {
		if (!storage || !autoBox) return;
		var enabled = readAutoOpen();
		autoBox.checked = enabled;
		var state = currentDestination();
		if (!state.valid || state.target !== "scheme" || !state.href) {
			lastAutoToken = "";
			return;
		}
		if (!enabled) {
			lastAutoToken = "";
			return;
		}
		if (initial && isBackForward()) return;
		if (state.token === lastAutoToken) return;
		lastAutoToken = state.token;
		if (typeof location.assign === "function") location.assign(state.href);
		else location.href = state.href;
	}
	function reset() {
		if (!copy) return;
		copy.textContent = copyLabel;
		copied.textContent = "";
	}
	refresh();
	maybeAutoOpen(true);
	window.addEventListener("hashchange", function () {
		reset();
		refresh();
		maybeAutoOpen(false);
	});
	window.addEventListener("pageshow", function () {
		if (storage && autoBox) autoBox.checked = readAutoOpen();
		refresh();
	});
	if (autoBox && storage) {
		autoBox.addEventListener("change", function () {
			try {
				if (autoBox.checked) storage.setItem(AUTO_KEY, "1");
				else storage.removeItem(AUTO_KEY);
			} catch (e) {
				autoBox.checked = readAutoOpen();
			}
		});
	}
	if (link) {
		link.addEventListener("click", function (event) {
			if (!refresh()) event.preventDefault();
		});
		link.addEventListener("auxclick", function (event) {
			if (!refresh()) event.preventDefault();
		});
		link.addEventListener("contextmenu", refresh);
	}
	if (copy) {
		copy.addEventListener("click", function () {
			if (!refresh()) return;
			var full = location.origin + location.pathname + "#" + location.hash.slice(1);
			function done() {
				copy.textContent = copy.getAttribute("data-copied");
				copied.textContent = copied.getAttribute("data-text");
			}
			function fallback() {
				var area = document.createElement("textarea");
				area.value = full;
				document.body.appendChild(area);
				area.select();
				if (document.execCommand("copy")) done();
				area.remove();
			}
			var clipboard = window.navigator && window.navigator.clipboard;
			if (clipboard && clipboard.writeText) clipboard.writeText(full).then(done, fallback);
			else fallback();
		});
	}
})();
`;
