# link-host

**Universal native-app handoff hosts for sol pbc.**

A single Cloudflare Worker that serves app-association surfaces for sol pbc's
native apps, dispatched by request host:

- `go.solstone.app` is the solstone universal-link surface: AASA claiming
  solstone, `assetlinks.json`, `/p` install-fallback, and webcredentials.
- `link.solpbc.org` is the extro surface: AASA claiming extro only and
  `/x/sync` install-fallback. No solstone, no assetlinks, no webcredentials.

The solstone pair-flow QR host is now `https://go.solstone.app/p#…`. It moved
off `link.solpbc.org` before launch.

> link-host adds no analytics, cookies, third-party scripts, or application
> request logs. Its production config disables Cloudflare's persisted built-in
> invocation events. Payload data rides in the URL fragment, which never enters
> HTTP. Open source so you can verify.

## what it is

iOS Universal Links and Android App Links require an
`apple-app-site-association` and `assetlinks.json` file at the URL's host. This
Worker serves two app-association handoff hosts from one codebase:

- `go.solstone.app` for solstone pair-flow links.
- `link.solpbc.org` for extro sync links.

Today `go.solstone.app` is consumed by
[sol private link (spl)](https://github.com/solpbc/spl) pair-flow QR codes:
scanning a `https://go.solstone.app/p#…` QR can open the solstone mobile app
when it is installed. Otherwise the fallback page links to the App Store or
Play Store. After installing, the owner can open a valid pairing link.

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
  (`7QCG8V4M6H.app.solstone.swift`, the paid Apple Developer team and app bundle).
  extro AASA carries `7QCG8V4M6H.org.solpbc.extro`.
  assetlinks on `go.solstone.app` claims the shipped Android phone package
  (`app.solstone.observer.phone`) with both the direct-release signing certificate
  and the Play App Signing certificate. The watch, glasses, and validation
  packages are deliberately unclaimed. File shape + headers + landing pages
  validate cleanly today; the iOS Universal Link handoff is wireable now.

## privacy properties

These are structural, not policy:

1. **The URL fragment never enters HTTP.** RFC 3986 fragments are processed
   client-side, so the pairing payload is absent from the request independently
   of any logging configuration.
2. **The pages collect nothing.** No cookies. No analytics. No third-party
   scripts. The pages ship no JavaScript; CSP blocks scripted connection APIs.
3. **Persisted invocation events are disabled.** Cloudflare's built-in
   per-request invocation logs are explicitly off in `wrangler.toml`. Workers
   Logs remains enabled for deliberate application error output; this source
   currently emits no application logs.
4. **Open source.** This repo is public from first commit. Readers can inspect
   the source and compare its expected responses with the live host.

External API calls from the Worker: none.

## routes

### `go.solstone.app`

| route | response |
|---|---|
| `GET /.well-known/apple-app-site-association` | solstone AASA JSON, `application/json`, `Cache-Control: public, max-age=3600`, no redirects |
| `GET /.well-known/assetlinks.json` | solstone assetlinks JSON, same caching posture |
| `GET /p` | solstone landing page (HTML, strict CSP) |
| `GET /` | bare host page (HTML, strict CSP, host-derived title/H1, `X-Robots-Tag: noindex`) |
| `GET /robots.txt` | disallow `/p` and `/x`, allow `/` and `/.well-known/*` |
| `GET /x/sync` | `404` |

### `link.solpbc.org`

| route | response |
|---|---|
| `GET /.well-known/apple-app-site-association` | extro AASA JSON, `application/json`, `Cache-Control: public, max-age=3600`, no redirects |
| `GET /x/sync` | extro landing page (HTML, strict CSP) |
| `GET /` | bare host page (HTML, strict CSP, host-derived title/H1, `X-Robots-Tag: noindex`) |
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
  assetlinks.ts       solstone assetlinks JSON (phone package + direct and Play certs)
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
no GH Actions deploy job, by design. This matches the
[spl-relay](https://github.com/solpbc/spl) precedent. Source of truth: this
repo's `main` branch. Readers can inspect the source and compare its expected
responses with the live host.

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
| CSO | `src/assetlinks.ts` | the Android package claim and the direct-release and Play App Signing certificate fingerprints |
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

1. **Solstone AASA shape:** paste `https://go.solstone.app` into the [Branch.io AASA validator](https://branch.io/resources/aasa-validator/) and confirm the file parses. Verify the actual handoff on an iPhone with the app installed.
2. **Extro AASA shape:** paste `https://link.solpbc.org` and confirm only the extro claim parses.
3. **assetlinks shape:** validate `https://go.solstone.app` with [Google's Digital Asset Links tool](https://developers.google.com/digital-asset-links/tools/generator). Then install an APK signed by the certificate being checked and inspect Android's App Links state. The installed app must also declare the matching `autoVerify` intent filter.
4. **CSP:** open `https://go.solstone.app/p` and `https://link.solpbc.org/x/sync` in a browser, open devtools, and confirm no third-party network requests (network tab should show only the page itself).

## see also

- [sol private link (spl)](https://github.com/solpbc/spl), the first consumer
  of `go.solstone.app`, the pair-flow QR codes for solstone mobile.
- [sol pbc](https://solpbc.org), public benefit corporation operating these
  systems.
