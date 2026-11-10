# Changelog

## 1.1.1

- Honor `custom.translatorSkip` for every field type, including localized uploads/PDFs and rich text. Excluded containers are not traversed.
- Preserve populated scalar destination values in empty-only mode, including valid `0` and `false` values.
- Enforce the requested source read access mode before invoking translation resolvers for collections and globals.
- Move the translator into its independent repository with explicit build tooling and packed-package integration checks.

For language-specific files, set `custom: { translatorSkip: true }` on the upload field. The destination keeps its own file or remains empty; this release does not repair files previously overwritten by older versions.

Public package entry points are unchanged. No consumer database migration is required by this package update.
