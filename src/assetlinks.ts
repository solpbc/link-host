// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// assetlinks.json content served at `/.well-known/assetlinks.json`. The
// shape is Google's; evolves only if Google changes it. The locked schema
// and the rationale live in the private product spec for this host.
//
// `package_name` = `app.solstone.observer.phone` is the application ID of the
// shipped phone app, per an internal product decision. It supersedes
// the never-shipped `app.solstone.android` value for this claim.
//
// Scoped to the phone package on purpose: the watch, glasses, and validation
// packages have no owner-visible link handling, so they stay unclaimed. Add a
// target block only when one of them gains its own.
//
// `sha256_cert_fingerprints` carries the certificate that signs the current
// release distributed outside Play — that is what those installs verify
// against. Play App Signing uses a different certificate for Play-distributed
// installs, so both certificates belong in this array. Off-Play installs
// still verify against the upload-key certificate.

export const ASSETLINKS = [
	{
		relation: ["delegate_permission/common.handle_all_urls"],
		target: {
			namespace: "android_app",
			package_name: "app.solstone.observer.phone",
			sha256_cert_fingerprints: [
				"12:DF:E3:2F:91:F7:18:25:90:09:27:37:91:7E:D7:19:33:7F:8F:9B:11:63:24:5B:3B:DC:34:79:A6:BE:26:60",
				"81:60:00:6B:5A:E1:41:87:03:B3:08:7E:08:6D:4C:D8:0D:64:C7:95:B0:72:C1:4C:81:C5:71:FC:3F:C2:34:A6",
			],
		},
	},
] as const;
