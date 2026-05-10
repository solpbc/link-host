// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// robots.txt. Disallow `/p` (per-user install-fallback page — no value to
// crawlers, and the URL fragment carries pair payloads). Allow `/` and
// `/.well-known/*` (public host description and platform-required AASA +
// assetlinks files).

export const ROBOTS = `User-agent: *
Disallow: /p
Allow: /.well-known/
Allow: /
`;
