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
// Day-1 claim: `/p` for the solstone spl pair-flow, with `/p2` reserved
// for a future v2 of the pair flow, plus extro-mobile claiming `/x/sync`.
// Additional sol pbc apps add their own blocks to `applinks.details` and
// their own paths.

export const AASA = {
	applinks: {
		details: [
			{
				appIDs: ["7QCG8V4M6H.app.solstone.swift"],
				components: [{ "/": "/p" }, { "/": "/p2" }],
			},
			{
				appIDs: ["7QCG8V4M6H.org.solpbc.extro"],
				components: [{ "/": "/x/sync" }],
			},
		],
	},
	webcredentials: { apps: ["7QCG8V4M6H.app.solstone.swift"] },
} as const;
