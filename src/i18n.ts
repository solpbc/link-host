// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

import { render } from "../i18n/generated/esm/link-host/api.mjs";
import { CATALOGS } from "../i18n/generated/esm/link-host/catalogs.mjs";

export const SOURCE_LOCALE = "en-US";
export const PACKAGED_LOCALES: readonly string[] = Object.keys(CATALOGS);

export function resolveLocale(
	acceptLanguage: string | null | undefined,
	packaged: readonly string[] = PACKAGED_LOCALES,
): string {
	if (!acceptLanguage || packaged.length <= 1) return SOURCE_LOCALE;
	const entries = acceptLanguage
		.split(",")
		.map((part, index) => {
			const [rawTag, ...params] = part.trim().split(";");
			let q = 1;
			for (const param of params) {
				const trimmed = param.trim();
				if (trimmed.startsWith("q=")) {
					const parsed = Number.parseFloat(trimmed.slice(2));
					if (Number.isFinite(parsed)) q = parsed;
				}
			}
			return { tag: rawTag.trim().toLowerCase(), q, index };
		})
		.filter((entry) => entry.tag.length > 0 && entry.q > 0)
		.sort((a, b) => b.q - a.q || a.index - b.index);

	for (const { tag } of entries) {
		const exact = packaged.find((loc) => loc.toLowerCase() === tag);
		if (exact) return exact;
		const primary = tag.split("-")[0];
		const byPrimary = packaged.find((loc) => loc.toLowerCase().split("-")[0] === primary);
		if (byPrimary) return byPrimary;
	}
	return SOURCE_LOCALE;
}

export function htmlLang(locale: string): string {
	return locale === SOURCE_LOCALE ? "en" : locale;
}

export const MESSAGE_IDS = [
	"link.journal.title",
	"link.journal.body",
	"link.journal.open",
	"link.journal.fallbacktitle",
	"link.journal.fallbackbody",
	"link.journal.panebody",
	"link.journal.copylink",
	"link.journal.copied",
	"link.journal.pastehint",
	"link.journal.installtitle",
	"link.journal.installbody",
	"link.journal.installdesktop",
	"link.journal.missing",
	"link.journal.invalid",
	"link.journal.copyagain",
	"link.journal.footer",
	"link.journal.applebadge",
	"link.journal.googlebadge",
	"link.journal.attribution",

	"link.extro.openextrolinksolpbcorg",
	"link.extro.openextroonyourphone",
	"link.extro.solpbcopensourcethispagecollectsnothing",
	"link.extro.thislinkwakesupextromobiletosync",
	"link.host.operatedbysolpbc",
	"link.host.thisissolpbcsuniversalapphandoff",
	"link.http.methodnotallowed",
	"link.http.notfound",
	"link.pair.donthavethesolstoneapponthis",
	"link.pair.finishpairinggosolstoneapp",
	"link.pair.finishpairingyourphonewithyourjournal",
	"link.pair.getsolstoneforandroid",
	"link.pair.getsolstoneforiphone",
	"link.pair.onlinuxyoucanalsosaveitas",
	"link.pair.openinthesolstoneapp",
	"link.pair.orpasteitinyourself",
	"link.pair.pairadevicegosolstoneapp",
	"link.pair.pairingaphoneinstead",
	"link.pair.pairthiscomputerwithyourjournal",
	"link.pair.solpbcopensourcethispagecollectsnothing",
	"link.pair.solstoneappinstall",
	"link.pair.thislinkworksonceandonlyfora",
	"link.pair.thispagesaddressisyourpairinglink",
	"link.pair.youopenedapairinglinkbutsolstonemobile",
] as const;

export type MessageId = (typeof MESSAGE_IDS)[number];

/**
 * Render a catalog message in the English source locale (`en-US`).
 *
 * The ESM target lowers `protected_slots` to Fluent string-literal placeables
 * (`{ "value" }`), which `@fluent/bundle` wraps in U+2068/U+2069 bidi isolation
 * marks. Every message in `link-host` is parameterless (`arguments: []`), so
 * stripping those marks preserves the exact literal slot bytes in `<title>` and
 * body text.
 */
export function t(id: MessageId, locale: string = SOURCE_LOCALE): string {
	return render(locale, id).replace(/[\u2068\u2069]/g, "");
}
