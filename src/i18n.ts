// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

import { render } from "../i18n/generated/esm/link-host/api.mjs";

export const SOURCE_LOCALE = "en-US";

export const MESSAGE_IDS = [
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
export function t(id: MessageId): string {
	return render(SOURCE_LOCALE, id).replace(/[\u2068\u2069]/g, "");
}
