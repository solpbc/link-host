// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 sol pbc

// robots.txt. Disallow directory prefixes `/p` and `/x` (per-user
// install-fallback paths — no value to crawlers, and `/p` URL fragments carry
// pair payloads). Allow `/` and `/.well-known/*` (public host description and
// platform-required AASA + assetlinks files) — `/` stays crawlable and is
// tagged `noindex` via the `X-Robots-Tag` header in index.ts instead of being
// disallowed, so an already-indexed root can actually see the noindex and
// drop out, rather than being locked into the index behind a Disallow it can
// no longer be fetched through.

export const ROBOTS = `User-agent: *
Disallow: /p
Disallow: /x
Allow: /.well-known/
Allow: /
`;
