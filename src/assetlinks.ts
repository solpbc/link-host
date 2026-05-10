// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// assetlinks.json content served at `/.well-known/assetlinks.json`. The
// shape is Google's; evolves only if Google changes it. See
// `cpo/specs/in-flight/link-solpbc-org-host.md` in the extro org for the
// locked schema and the rationale.
//
// `package_name` = `app.solstone.android` is the confirmed value (CPO
// decision `260510-cpo-link-bundle-id-namespace-app-solstone-confirmed`;
// extro request `req_lprtek4k`). The package is not yet reserved — that
// happens during Google Play Console enrollment (founder ask
// `stakeholders/jeremie-miller/asks/google-play-developer-enrollment.md`,
// status: ready). Validators will fail package-lookup until enrollment
// lands.
//
// `sha256_cert_fingerprints` remains a placeholder pending (a) Google Play
// developer enrollment, then (b) Android upload-signing key generation
// during the first Android build. Replace via PR + manual deploy when both
// land. File shape + headers pass today.

export const ASSETLINKS = [
	{
		relation: ["delegate_permission/common.handle_all_urls"],
		target: {
			namespace: "android_app",
			package_name: "app.solstone.android",
			sha256_cert_fingerprints: [
				"00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00",
			],
		},
	},
] as const;
