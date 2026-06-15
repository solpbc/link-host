# link-host

**Universal native-app handoff hosts for sol pbc.**

A single Cloudflare Worker that serves app-association surfaces for sol pbc's
native apps, dispatched by request host:

- `go.solstone.app` is the solstone universal-link surface: AASA claiming
  solstone, `assetlinks.json`, `/p` install-fallback, and webcredentials.
- `link.solpbc.org` is the extro surface: AASA claiming extro only and
  `/x/sync` install-fallback. No solstone, no assetlinks, no webcredentials.

The solstone pair-flow QR host is now `https://go.solstone.app/p#…`. It moved
off `link.solpbc.org` as a hard cutover before users existed.

> link-host collects nothing. No analytics, no cookies, no third-party scripts.
> Payload data rides in the URL fragment, which never reaches this server. Open
> source so you can verify.

## what it is

iOS Universal Links and Android App Links require an
`apple-app-site-association` and `assetlinks.json` file at the URL's host. This
Worker serves two app-association handoff hosts from one codebase:

- `go.solstone.app` for solstone pair-flow links.
- `link.solpbc.org` for extro sync links.

Today `go.solstone.app` is consumed by
[sol private link (spl)](https://github.com/solpbc/spl) pair-flow QR codes:
scanning a `https://go.solstone.app/p#…` QR either opens the solstone mobile app
(if installed) or takes the user to the App Store / Play Store with the payload
preserved through the platform deferred-deep-link mechanism.

Future sol pbc apps add their own paths to the relevant host via a small PR.

- **Operator:** sol pbc (deployed at `https://go.solstone.app` and
  `https://link.solpbc.org`).
- **License:** [AGPL-3.0-only](LICENSE).
- **Not the relay.** This Worker serves the two handoff hosts:
  `go.solstone.app` for solstone pair-flow and `link.solpbc.org` for extro sync.
  They serve AASA/assetlinks + install-fallback pages, hold no keys, see no
  payload, and run no relay.

  `link.solstone.app` is a different service: the hosted
  [spl](https://github.com/solpbc/spl) `spl-relay` (`/enroll`, `/session`,
  `/tunnel`, the JWT `iss`, `/.well-known/jwks.json`). It lives in the `spl`
  repo, not this Worker.

  Rule of thumb: solstone pair QR → `go.solstone.app/p`; extro sync link →
  `link.solpbc.org/x/sync`; anything that enrolls, issues a token, or carries
  tunnel bytes → `link.solstone.app`. Never cross handoff with relay.
- **Status:** solstone AASA carries the confirmed iOS value
  (`7QCG8V4M6H.app.solstone.swift` — sol pbc paid Apple Developer team crossed
  with the minted bundle). extro AASA carries `7QCG8V4M6H.org.solpbc.extro`.
  assetlinks carries the confirmed Android package name (`app.solstone.android`)
  on `go.solstone.app`; the signing-cert SHA256 stays on placeholder until
  Google Play developer enrollment + first Android build. File shape + headers +
  landing pages validate cleanly today; the iOS Universal Link handoff is
  wireable now.

## privacy properties

These are structural, not policy:

1. **The URL fragment never reaches the server.** RFC 3986 — fragments are
   processed client-side. The Worker tail sees only the path.
2. **The pages collect nothing.** No cookies. No analytics. No third-party
   scripts. Strict CSP `connect-src 'none'` makes accidental beaconing
   impossible — the JS literally cannot make a network request.
3. **Open source.** This repo is public from first commit. Verify the
   deployed Worker against this source by checksumming the script.

External API calls from the Worker: none.

## routes

### `go.solstone.app`

| route | response |
|---|---|
| `GET /.well-known/apple-app-site-association` | solstone AASA JSON, `application/json`, `Cache-Control: public, max-age=3600`, no redirects |
| `GET /.well-known/assetlinks.json` | solstone assetlinks JSON, same caching posture |
| `GET /p` | solstone landing page (HTML, strict CSP) |
| `GET /` | bare host page (HTML, strict CSP, host-derived title/H1) |
| `GET /robots.txt` | disallow `/p` and `/x`, allow `/` and `/.well-known/*` |
| `GET /x/sync` | `404` |

### `link.solpbc.org`

| route | response |
|---|---|
| `GET /.well-known/apple-app-site-association` | extro AASA JSON, `application/json`, `Cache-Control: public, max-age=3600`, no redirects |
| `GET /x/sync` | extro landing page (HTML, strict CSP) |
| `GET /` | bare host page (HTML, strict CSP, host-derived title/H1) |
| `GET /robots.txt` | disallow `/p` and `/x`, allow `/` and `/.well-known/*` |
| `GET /p` | `404` |
| `GET /.well-known/assetlinks.json` | `404` |

On both hosts, anything else returns `404`; any `POST`/`PUT`/`DELETE`/`PATCH`
returns `405`.

The AASA/assetlinks payloads, HTML pages, and robots.txt are TypeScript string
modules in `src/`, inlined by the Worker router. There is no `static/` content.

## repo layout

```
src/
  index.ts            CF Worker — host-aware routes, headers, CSP
  index.test.ts       Worker route tests
  aasa.ts             two host-specific AASA payloads, solstone + extro
  assetlinks.ts       solstone assetlinks JSON (placeholder cert SHA256)
  landing.ts          /p HTML — UA-aware solstone install-fallback page
  landing-extro.ts    /x/sync HTML — extro install-fallback page
  index-page.ts       / HTML — bare host page
  robots.ts           robots.txt
wrangler.toml         CF Worker config (two custom-domain routes)
package.json          deps, scripts
tsconfig.json         strict TS
biome.json            lint + format
```

## development

```sh
# install deps
npm install

# run locally on Miniflare
npm run dev
# → http://localhost:8787/

# typecheck, lint, test
npm run typecheck
npm run lint
npm test

# full local CI shim
make ci
```

## deploy

Manual `wrangler deploy` from an authenticated operator workstation. There is
no GH Actions deploy job, by design — matches the
[spl-relay](https://github.com/solpbc/spl) precedent. Source of truth: this
repo's `main` branch. Anyone can verify the deployed Worker by checksumming it
against the published source.

```sh
# one-time: log in to the sol pbc CF account
wrangler login

# deploy current main to the configured custom domains
wrangler deploy
```

The Worker is bound to `go.solstone.app` and `link.solpbc.org` via two
`[[routes]]` blocks in `wrangler.toml`. DNS is auto-managed by Cloudflare; HTTPS
certs are auto-provisioned by Cloudflare.

## editing content

| who | file | what they edit |
|---|---|---|
| CSO | `src/assetlinks.ts` | `sha256_cert_fingerprints` once Google Play developer enrollment + the first Android upload-signing key are minted |
| CMO | `src/landing.ts` | solstone landing page copy slots (H1, sub, CTAs, footer); App Store / Play Store URLs once each listing is live |
| CMO | `src/landing-extro.ts` | extro fallback copy |
| CMO | `src/index-page.ts` | bare host page copy |

All edits flow PR → manual deploy.

## adding a new sol pbc app

Day-1 claims are split by host: solstone on `go.solstone.app`, extro on
`link.solpbc.org`. Future products (aha, vit, etc.) add their own entries to
the relevant host's AASA payload:

1. Add a new bundle + path block to `src/aasa.ts` under the relevant host
   payload.
2. Add a new target block to `src/assetlinks.ts` if the host needs Android App
   Links.
3. Optional: add a new HTML route in `src/index.ts` if the path needs a
   different fallback page (most won't).
4. PR + manual deploy.

## verifying

After deploy, check:

1. **Solstone AASA shape:** [Branch.io AASA validator](https://branch.io/resources/aasa-validator/) — paste `https://go.solstone.app` and confirm the file parses. Bundle-ID lookup will fail until Apple Developer Program enrollment ships; file shape + headers should pass.
2. **Extro AASA shape:** paste `https://link.solpbc.org` and confirm only the extro claim parses.
3. **assetlinks shape:** [Google's Digital Asset Links tool](https://developers.google.com/digital-asset-links/tools/generator) — validate `https://go.solstone.app`. Same caveat for package + cert.
4. **CSP:** open `https://go.solstone.app/p` and `https://link.solpbc.org/x/sync` in a browser, open devtools, and confirm no third-party network requests (network tab should show only the page itself).

## see also

- [sol private link (spl)](https://github.com/solpbc/spl) — the first consumer
  of `go.solstone.app`, the pair-flow QR codes for solstone mobile.
- [sol pbc](https://solpbc.org) — public benefit corporation operating these
  systems.
