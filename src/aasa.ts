// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// apple-app-site-association content served at
// `/.well-known/apple-app-site-association`. JSON only (no signed pkcs7;
// modern iOS handles plain JSON over HTTPS). The shape is Apple's; evolves
// only if Apple changes it. The locked schema and the rationale live in
// the private product spec for this host.
//
// Bundle IDs on sol pbc's Apple Developer Program team (`7QCG8V4M6H`):
// - `app.solstone.swift` (iOS/iPadOS): claims `/p` and `/j` plus webcredentials.
// - `app.solstone.observer` (macOS): claims `/j` only, keeping `/p` and
//   webcredentials on `app.solstone.swift`.
// - `org.solpbc.extro` (served on link.solpbc.org): claims `/x/sync` only.
// Additional sol pbc apps add their own blocks to the relevant host's
// `applinks.details` and their own paths.

const SOLSTONE_APP_ID = "7QCG8V4M6H.app.solstone.swift";
const SOLSTONE_MAC_APP_ID = "7QCG8V4M6H.app.solstone.observer";
const EXTRO_APP_ID = "7QCG8V4M6H.org.solpbc.extro";

export const SOLSTONE_AASA = {
	applinks: {
		details: [
			{
				appIDs: [SOLSTONE_APP_ID],
				components: [{ "/": "/p" }, { "/": "/j" }],
			},
			{
				appIDs: [SOLSTONE_MAC_APP_ID],
				components: [{ "/": "/j" }],
			},
		],
	},
	webcredentials: { apps: [SOLSTONE_APP_ID] },
} as const;

export const EXTRO_AASA = {
	applinks: {
		details: [
			{
				appIDs: [EXTRO_APP_ID],
				components: [{ "/": "/x/sync" }],
			},
		],
	},
} as const;
