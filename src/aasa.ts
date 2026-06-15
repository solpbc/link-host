// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// apple-app-site-association content served at
// `/.well-known/apple-app-site-association`. JSON only (no signed pkcs7;
// modern iOS handles plain JSON over HTTPS). The shape is Apple's; evolves
// only if Apple changes it. See `cpo/specs/in-flight/link-solpbc-org-host.md`
// in the extro org for the locked schema and the rationale.
//
// Bundle ID is the sol pbc paid Apple Developer Program team (`7QCG8V4M6H`)
// crossed with the minted `app.solstone.swift` bundle (ASC ID `MCH2T65ZQL`,
// Push + App Groups capabilities provisioned). Confirmed 2026-05-10 via
// CPO decision `260510-cpo-link-bundle-id-namespace-app-solstone-confirmed`
// (extro request `req_lprtek4k`); canonical signing architecture in
// `shared/vendors/apple.md` §signing architecture.
//
// Split claims: the solstone payload (served on go.solstone.app) claims `/p`
// for the solstone spl pair-flow, reserves `/p2` for a future v2, and carries
// webcredentials. The extro payload (served on link.solpbc.org) claims
// `/x/sync` and carries no webcredentials. Additional sol pbc apps add their
// own blocks to the relevant host's `applinks.details` and their own paths.

const SOLSTONE_APP_ID = "7QCG8V4M6H.app.solstone.swift";
const EXTRO_APP_ID = "7QCG8V4M6H.org.solpbc.extro";

export const SOLSTONE_AASA = {
	applinks: {
		details: [
			{
				appIDs: [SOLSTONE_APP_ID],
				components: [{ "/": "/p" }, { "/": "/p2" }],
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
