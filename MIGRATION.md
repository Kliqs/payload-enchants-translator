# Translator extraction

## Provenance

- Source: https://github.com/Kliqs/payload-enchants
- Original upstream: https://github.com/r1tsuu/payload-enchants
- Source commit: `d41e61ea2fa5018ba34b04d8b81d6f6fb13fe40a`
- Source directory: `packages/translator`
- Extracted history tip: `1c1392c16260f37fae0f7a6588c48b24cbd4c9a7`
- Extraction: `git subtree split --prefix=packages/translator`
- 69 relevant commits retained. Extraction rewrites commit IDs; monorepo commits
  that never affected translator are omitted.
- Local `main` marks that extracted baseline. All migration changes are on
  `chore/standalone-translator` for review through a pull request.

## What changed

No imports in the translator source reach another monorepo package. Relative
imports resolve within the plugin; external code comes from npm or Node.js.
The standalone repository retains the npm name, version, public export paths,
resolver implementations and translation operation.

Build dependencies previously inherited from the monorepo are explicit now.
Payload development dependencies remain at 3.1.0; React uses the effective
version previously enforced by the monorepo overrides. Dependency ranges are
resolved into new standalone lockfiles, so transitive versions are not an
exact reproduction of the old monorepo lockfile.

The package export conditions put `types` first without changing their paths.
The root ESLint configuration and upstream MIT license are carried over.
The old npm lockfile and checked-in 1.0.5 archive are removed from the current
tree; historical commits remain intact.

Two small source compatibility fixes were required by the existing Payload
3.1.0 baseline:

- Read group fields before the unnamed-group type guard narrows the field
  to `never`. The runtime branch remains supported.
- Remove the unsupported `margin` prop from the glossary Button. Its spacing
  should be visually checked when glossary is enabled.

Three files also have property ordering changes required by inherited lint
rules. Those mechanical changes have their own commit.

The playground is a separate consumer of the packed tarball, with no sibling
plugins or source aliases. It uses the original Next/Payload route templates;
its lint overrides accommodate generated code. No auto-login or pre-created
account is configured. The development server listens on localhost.

## Validation

- TypeScript declaration build and package typecheck passed.
- Vitest regression tests passed for glossary validation and empty-only /
  excluded fields.
- Packed tarball contains every public export target, both SCSS files and
  the MIT license. Two clean builds produced the same tarball SHA256.
- Frozen-lockfile installation of the rebuilt tarball passed.
- An isolated temporary MongoDB test using the installed tarball passed:
  collection copying, global copying, preserving existing destination text
  for empty-only mode, and leaving excluded fields unchanged.
- Payload admin import-map generation, playground typecheck and production
  Next.js build passed.

## Review and remaining limits

AI role: AI extracted history, prepared standalone tooling and the playground,
and made the two compatibility fixes; human review is pending.

Traffic-light zone: Red (repository/build architecture), confirmed by the
implementation go-ahead. A senior developer should review before merging.
Ponytail review was performed against local `main`, including package exports,
consumer configuration, cleanup, CI ordering and the source changes.

The diff includes substantial generated lockfile changes and removal of an
old binary archive. Review source compatibility commits first, then package
configuration, then playground config/smoke test and CI. The unchanged plugin
source is already represented by the extracted baseline history.

Remaining limits:

- No browser interaction or visual verification of admin/glossary controls.
- No paid translation requests or live glossary synchronization were run.
- Existing lint style warnings and React prerelease peer warnings remain.
- The old Next 15.0.0 baseline emits a known-vulnerability warning during
  installation. The playground is for local migration checks only; upgrading
  Next/Payload is a separate task before any deployment.
- Local checks used Node 24.18.0; CI specifies Node 22 and has not run remotely.
- Independent remote: https://github.com/Kliqs/payload-enchants-translator.
  Package repository and issue metadata now point to this remote.
- No npm package was published and the original repository remains intact.
