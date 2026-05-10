// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// assetlinks.json content served at `/.well-known/assetlinks.json`. The
// shape is Google's; evolves only if Google changes it. See
// `cpo/specs/in-flight/link-solpbc-org-host.md` in the extro org for the
// locked schema and the rationale.
//
// `package_name` and `sha256_cert_fingerprints` below are placeholders
// pending Google Play Console enrollment by CSO (extro request
// `req_hbpmzyz5`). Once CSO publishes the values, replace via PR + manual
// deploy. Validators will fail on bundle-ID lookup until then; file shape
// + headers still pass.

export const ASSETLINKS = [
	{
		relation: ["delegate_permission/common.handle_all_urls"],
		target: {
			namespace: "android_app",
			package_name: "org.solpbc.solstone",
			sha256_cert_fingerprints: [
				"00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00",
			],
		},
	},
] as const;
