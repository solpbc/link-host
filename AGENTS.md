# link-host — agent guide

`link-host` is a single Cloudflare Worker serving sol pbc's universal native-app
handoff surfaces, dispatched by request host: `go.solstone.app` (solstone
universal-link surface) and `link.solpbc.org` (extro sync surface). It holds no
keys, sees no payload, runs no relay — it serves AASA / `assetlinks.json` /
install-fallback HTML and nothing else.

**Read [`README.md`](README.md) first** — it is the authoritative spec for the
route table, the privacy properties, the host-split, the content-edit ownership
map (who edits which `src/*.ts`), the "never cross handoff with relay" rule, and
the deploy/verify steps. This file does not restate that; it covers how to work
in the repo correctly. `CLAUDE.md` and `GEMINI.md` are symlinks to this file.

## Orientation

- One Worker, two custom-domain routes (`wrangler.toml`), host-dispatched by
  `hostKind()` in `src/index.ts`. Solstone claims live on `go.solstone.app`;
  extro claims on `link.solpbc.org`. They do **not** bleed across hosts — a
  solstone path on the extro host is a `404`, and vice-versa. Keep that split
  hard when adding anything.
- All served content (AASA payloads, assetlinks, HTML pages, robots.txt) is a
  TypeScript string module in `src/`, inlined by the router. **There is no
  `static/` directory** and no build step for content — edit the `.ts` module.
- The whole surface is `GET`-only HTML/JSON. Non-GET verbs return `405`;
  unknown paths return `404`. There is no API, no database, no auth, no state.

## Build / test / deploy

`make` wraps the npm scripts (the npm scripts in `package.json` are the
authoritative tasks):

```bash
make install     # npm ci
make dev         # wrangler dev → http://localhost:8787/
make typecheck   # tsc --noEmit
make lint        # biome check
make test        # vitest (src/index.test.ts — route + header + CSP assertions)
make ci          # typecheck + lint + test — the gate; green before commit
make deploy      # wrangler deploy (operator-run; see README)
```

## Invariants that must not regress — these *are* the product

The privacy properties in the README are structural guarantees, not nice-to-haves.
A change that weakens any of them is the wrong change regardless of size:

- **No payload ever reaches or is logged by the Worker.** The handoff payload
  rides in the URL *fragment*, which is client-side per RFC 3986 — the Worker
  must never depend on, parse, store, or log it. The CF observability tail
  carries `<method> <path> <status>` only; never add logging that captures more.
- **No beaconing surface.** The HTML responses ship a strict CSP with
  `connect-src 'none'` so any future client-side script *cannot* make a network
  request. Never relax the CSP to add an analytics/telemetry/third-party script —
  there are none, by covenant ([sol pbc data covenants](https://solpbc.org)), and
  adding one is a fail-stop change. No cookies, anywhere.
- **No external calls.** The Worker makes zero outbound fetches. If you reach for
  one, stop — there's a wrong turn upstream.
- **No keys, no relay.** This Worker never holds a key or carries tunnel bytes.
  Anything that enrolls, issues a token, or moves payload bytes belongs in the
  separate `spl` repo (`link.solstone.app`), not here. See README "Not the relay."

## Coding principles (sol pbc engineering standards, inlined)

Hopper lodes can't read the org's private engineering standards, so the load-bearing
ones live here:

- **KISS / YAGNI.** This is intentionally a tiny, dependency-light Worker. Don't
  add config, abstraction, or "future-proofing" for cases that don't exist. A new
  app claim is a few lines in `src/aasa.ts` (+ maybe `assetlinks.ts`), not a
  framework. The README's "adding a new sol pbc app" steps are the whole story.
- **Fail clearly at the boundary.** Unknown host → safe default; unknown path →
  `404`; wrong method → `405`. Validate the request shape at the edge; don't
  invent fallbacks for inputs the router already constrains.
- **Reference, don't duplicate.** The README owns the route/privacy/content spec;
  this file owns coding guidance. Don't copy the route table into a third place
  that has to be kept in sync. The full design lives in the extro org at
  `cpo/specs/in-flight/link-solpbc-org-host.md` (private; reference only).
- **Open source is the product.** This repo is public from first commit; the
  trust claim is "checksum the deployed Worker against this source." Keep every
  visible file clean of private operational context, internal paths, and machine
  names.
- **Test the contract, not a snapshot.** `src/index.test.ts` asserts route
  responses, headers, caching posture, and the CSP. When you change a served
  payload or header, update the assertion to the new contract — don't pin a test
  to copy that's designed to change (landing-page wording, store URLs).
- **Vendor everything client-side.** No third-party CDNs/fonts/scripts in served
  HTML — the CSP forbids it anyway. CSS is inlined and verifiable in-repo.

## Conventions

- **License: AGPL-3.0-only** (`LICENSE`, `package.json`). New `.ts` source files
  carry the SPDX header immediately at the top, matching the existing files:
  ```ts
  // SPDX-License-Identifier: AGPL-3.0-only
  // Copyright (c) 2026 sol pbc
  ```
  Don't add headers to docs, config, or generated files.
- **Build interface is `make`** (wrapping npm); **runtime is Cloudflare Workers**
  via `wrangler`. TypeScript strict; Biome for lint/format.
- **No GitHub Actions / no CI deploy — by design.** Every deploy is `wrangler
  deploy` run by an authenticated operator from a local machine (matches the
  `spl-relay` precedent). Credentials never live in GitHub. Don't add a
  `.github/workflows/` deploy job.
- **Secrets:** none today (the Worker holds no keys). If that ever changes, they
  go via `wrangler secret put`, never in the repo, never in `[vars]`, never logged.
- **Owner-facing copy** (the landing pages) follows sol pbc brand voice —
  lowercase-first, no surveillance verbs (watch/capture/record/monitor/track/
  collect). Copy edits are CMO-owned per the README map; flow PR → manual deploy.
