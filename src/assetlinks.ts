// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// assetlinks.json content served at `/.well-known/assetlinks.json`. The
// shape is Google's; evolves only if Google changes it. See
// `cpo/specs/in-flight/link-solpbc-org-host.md` in the extro org for the
// locked schema and the rationale.
//
// `package_name` = `app.solstone.observer.phone` is the application ID of the
// shipped phone app (CPO decision
// `260716-cpo-android-app-links-target-shipped-phone-package`). It supersedes
// the never-shipped `app.solstone.android` value for this claim.
//
// Scoped to the phone package on purpose: the watch, glasses, and validation
// packages have no owner-visible link handling, so they stay unclaimed. Add a
// target block only when one of them gains its own.
//
// `sha256_cert_fingerprints` carries the certificate that signs the current
// release distributed outside Play — that is what those installs verify
// against. Play App Signing is mandatory at the first Play upload and may
// issue a *different* app-signing certificate. If it does, **add** that
// fingerprint to this array (Digital Asset Links accepts several) before
// Play-distributed installs are expected to verify. Do not replace the value
// below to make room for it — off-Play installs still verify against it.

export const ASSETLINKS = [
	{
		relation: ["delegate_permission/common.handle_all_urls"],
		target: {
			namespace: "android_app",
			package_name: "app.solstone.observer.phone",
			sha256_cert_fingerprints: [
				"12:DF:E3:2F:91:F7:18:25:90:09:27:37:91:7E:D7:19:33:7F:8F:9B:11:63:24:5B:3B:DC:34:79:A6:BE:26:60",
			],
		},
	},
] as const;
