// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// apple-app-site-association content served at
// `/.well-known/apple-app-site-association`. JSON only (no signed pkcs7;
// modern iOS handles plain JSON over HTTPS). The shape is Apple's; evolves
// only if Apple changes it. See `cpo/specs/in-flight/link-solpbc-org-host.md`
// in the extro org for the locked schema and the rationale.
//
// Bundle IDs below are placeholders pending Apple Developer Program
// enrollment by CSO (extro request `req_hbpmzyz5`). Once CSO publishes
// `<TEAM_ID>` and `<BUNDLE_ID>`, replace `0000000000.org.solpbc.solstone`
// with the actual value via PR + manual deploy. Validators will fail on
// bundle-ID lookup until then; file shape + headers still pass.
//
// Day-1 claim: `/p` for the solstone spl pair-flow, with `/p2` reserved
// for a future v2 of the pair flow. Additional sol pbc apps add their own
// blocks to `applinks.details` and their own paths.

export const AASA = {
	applinks: {
		details: [
			{
				appIDs: ["0000000000.org.solpbc.solstone"],
				components: [
					{ "/": "/p", comment: "spl pair-flow universal link" },
					{ "/": "/p2", comment: "reserved — future spl pair-flow v2" },
				],
			},
		],
	},
	webcredentials: { apps: ["0000000000.org.solpbc.solstone"] },
} as const;
