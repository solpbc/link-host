# link.solpbc.org

**Universal native-app handoff host for sol pbc.**

A single Cloudflare Worker that serves the apple-app-site-association and
assetlinks.json files for sol pbc's native apps, plus a minimal static landing
page that bridges scans / shared links into install when the app isn't there
yet.

> link.solpbc.org collects nothing. No analytics, no cookies, no third-party
> scripts. Payload data rides in the URL fragment, which never reaches this
> server. Open source so you can verify.

## what it is

iOS Universal Links and Android App Links require an
`apple-app-site-association` and `assetlinks.json` file at the URL's host.
`link.solpbc.org` is sol pbc's portfolio-wide host for those files plus a
minimal install-fallback page.

Today it is consumed by [sol private link (spl)](https://github.com/solpbc/spl)
pair-flow QR codes: scanning a `https://link.solpbc.org/p#…` QR either opens
the solstone mobile app (if installed) or takes the user to the App Store /
Play Store with the payload preserved through install via the platform
deferred-deep-link mechanism. Future sol pbc apps add their own paths via a
one-line PR.

- **Operator:** sol pbc (deployed at `https://link.solpbc.org`).
- **License:** [AGPL-3.0-only](LICENSE).
- **Status:** initial deploy with placeholder bundle IDs pending Apple
  Developer Program + Google Play Console enrollment. AASA + assetlinks will
  fail validator bundle-ID lookup until those values land. File shape +
  headers + landing page validate cleanly today.

## privacy properties

These are structural, not policy:

1. **The URL fragment never reaches the server.** RFC 3986 — fragments are
   processed client-side. The Worker tail sees only the path.
2. **The page collects nothing.** No cookies. No analytics. No third-party
   scripts. Strict CSP `connect-src 'none'` makes accidental beaconing
   impossible — the JS literally cannot make a network request.
3. **Open source.** This repo is public from first commit. Verify the
   deployed Worker against this source by checksumming the script.

External API calls from the Worker: none.

## routes

| route | response |
|---|---|
| `GET /.well-known/apple-app-site-association` | AASA JSON, `application/json`, `Cache-Control: public, max-age=3600`, no redirects |
| `GET /.well-known/assetlinks.json` | assetlinks JSON, same caching posture |
| `GET /p` | landing page (HTML, strict CSP) |
| `GET /` | bare host page (HTML, strict CSP) |
| `GET /robots.txt` | disallow `/p`, allow `/` and `/.well-known/*` |
| anything else | `404` |
| any `POST`/`PUT`/`DELETE`/`PATCH` | `405` |

The AASA + assetlinks files are checked into `static/`. The HTML pages and
robots.txt live alongside them. The Worker (`src/index.ts`) is a tiny router
that reads each file as an inlined string and emits the right headers.

## repo layout

```
src/
  index.ts            CF Worker — routes, headers, CSP
  aasa.ts             AASA JSON (placeholder bundle IDs until CSO mints)
  assetlinks.ts       assetlinks JSON (placeholder package + cert SHA256)
  landing.ts          /p HTML — UA-aware install-fallback page
  index-page.ts       / HTML — bare host page
  robots.ts           robots.txt
wrangler.toml         CF Worker config (account ID + custom domain route)
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

# typecheck + lint
npm run typecheck
npm run lint
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

# deploy current main to https://link.solpbc.org
wrangler deploy
```

The Worker is bound to the `link.solpbc.org` custom domain via the
`[[routes]]` block in `wrangler.toml`. DNS is auto-managed by Cloudflare; the
HTTPS cert is auto-provisioned by Cloudflare.

## editing the static content

| who | file | what they edit |
|---|---|---|
| CSO | `src/aasa.ts` | `<TEAM_ID>.<BUNDLE_ID>` after Apple Developer Program enrollment |
| CSO | `src/assetlinks.ts` | `<ANDROID_PACKAGE_NAME>` + `<SHA256_OF_SIGNING_CERT>` after Play Console enrollment |
| CMO | `src/landing.ts` | landing page copy slots (H1, sub, CTAs, footer) |
| CMO | `src/index-page.ts` | bare host page copy |

All edits flow PR → manual deploy.

## adding a new sol pbc app

Day-1 AASA + assetlinks claim only `/p*` for the solstone iOS + Android
bundles. Future products (aha, vit, etc.) add their own entries:

1. Add a new bundle/package + path block to `src/aasa.ts` `applinks.details`.
2. Add a new target block to `src/assetlinks.ts`.
3. Optional: add a new HTML route in `src/index.ts` if the path needs a
   different fallback page (most won't).
4. PR + manual deploy.

## verifying

After deploy, three things to check:

1. **AASA shape:** [Branch.io AASA validator](https://branch.io/resources/aasa-validator/) — paste `https://link.solpbc.org` and confirm the file parses. Bundle-ID lookup will fail until Apple Developer Program enrollment ships; file shape + headers should pass.
2. **assetlinks shape:** [Google's Digital Asset Links tool](https://developers.google.com/digital-asset-links/tools/generator) — same caveat for package + cert.
3. **CSP:** open `https://link.solpbc.org/p` in a browser, open devtools, and confirm no third-party network requests (network tab should show only the page itself).

## see also

- [sol private link (spl)](https://github.com/solpbc/spl) — the first
  consumer of this host, the pair-flow QR codes for solstone mobile.
- [sol pbc](https://solpbc.org) — public benefit corporation operating
  these systems.
