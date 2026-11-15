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
