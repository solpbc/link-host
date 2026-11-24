# link-host string catalog

This Worker owns its English source in `catalog/`. It ships only `en-US`.
The generated module is `generated/esm/link-host/`. The Worker renders that
module. No request fetches a catalog.

Regenerate with the catalog compiler from solstone-journal, at the revision
recorded in `compiler.json`:

```sh
I18N_COMPILER=/path/to/i18n-catalog node scripts/i18n.mjs
make test
```

For source edits, follow the compiler's `tools/i18n/README.md` instructions for
source locks, sidecar revisions and permanent identities before regenerating.
`make test` checks source ids, rendered English, and the committed hashes of
the catalog, the pin and the generated files. Build and test use committed
output and do not need the compiler or network access to render text.

`src/i18n.ts` strips Fluent isolation marks from rendered English. Every
current message takes no arguments. Rendering always uses `en-US`. Adding a
language requires registry membership, a reviewed catalog and an explicit
caller change.

## Draft locales

`es-419` is registered in the pinned locale registry as a draft locale (`development` released, `production` withheld). Draft translations live in `catalog/translations/es-419.ftl` (or sharded files under `catalog/translations/es-419/`), and production builds exclude them. Unapproved legal and statutory messages stay absent from draft translation files and fall back to English in development builds. When editing English prose, run `i18n-catalog lock` to refresh `source-lock.json`, copy each changed `source` hash into its sidecar `source_revision`, and do not pass `--acknowledge es-419`: leaving the prior acknowledgment untouched marks edited draft entries stale until a translator updates them.
