# Build & Test Scripts

This directory contains the build and test orchestration for PixiJS.

## Quick reference

| Command | Description |
| --- | --- |
| `npm run build` | Full production build (bundle + types + DTS bundle) |
| `npm run build:lib` | Dev build (bundle + types, no DTS bundling) |
| `npm run build:docs` | Generate TypeDoc API documentation |
| `npm start` | Start playground dev server + watch mode |
| `npm test` | Run all checks (lint, types, index, prune, unit, visual) |
| `npm run test:unit` | Unit tests only |
| `npm run test:visual` | Visual regression tests only |
| `npm run test:lint` | Lint checks only |
| `npm run test:types` | Type checking only |
| `npm run lint` | Lint with auto-fix |

## Build pipeline (`build.mts`)

The build script accepts two flags:

- `--lib` — Library-only build. Skips package exports validation and DTS bundle generation. Sets `LIB_ONLY=1` for Rollup so only the library bundle is emitted.
- `--dev` — Development mode. Allows type-check errors without failing, and skips `dts-bundle-generator`.

### Build phases

1. **Index + exports** (parallel) — Regenerates the barrel `index.ts` files and validates package exports. The exports step is skipped for `--lib` without `--dev`.
2. **Rollup + types** (parallel) — Bundles the library with Rollup while concurrently running `tsc`, copying `.d.ts` files, fixing types, and optionally generating the DTS bundle.

### Watch modes

- `watch:lib` — Rebuilds on source changes with `--lib --dev`. Writes `.build-status.json` via `build-status.mjs` so the playground can show a compiling/ready indicator.
- `watch:build` — Full dev rebuild on source changes (includes types).
- `watch:docs` — Rebuilds TypeDoc docs on source or markdown changes.

## Test pipeline (`test.mts`)

The test script runs checks in two phases. Pass selectors to run specific checks:

```
npm run test [selector...] [-- flags]
```

### Selectors

| Selector | Phase | Blocking | Description |
| --- | --- | --- | --- |
| `lint` | Static | Yes | ESLint with `--max-warnings 0` |
| `types` | Static | Yes | `tsc --noEmit` against build, examples, and playground configs |
| `index` | Static | Yes | Validates barrel index files are up to date |
| `prune` | Static | No | Knip dead-code analysis (failure is reported but non-blocking) |
| `unit` | Jest | Yes | Unit tests (excludes `tests/visual/`) |
| `visual` | Jest | Yes | Visual regression tests (`tests/visual/`) |
| `debug` | — | — | Modifier: runs Jest in headful mode with `DEBUG_MODE=1` |

When no selectors are specified, all checks run.

### Phases

1. **Static checks** — `lint`, `types`, `index`, and `prune` run in parallel. If any blocking check fails, Jest tests are skipped and the process exits with code 1.
2. **Jest tests** — `unit` and `visual` run sequentially. The `debug` selector enables headful browser DevTools for interactive debugging.

Extra CLI flags (those starting with `-`) are forwarded to the underlying tool.

## Build status (`build-status.mjs`)

A small helper used by `watch:lib` to signal the playground's build status indicator:

```
node scripts/build-status.mjs start   # writes { status: 'compiling', startedAt: ... }
node scripts/build-status.mjs done    # writes { status: 'ready', completedAt: ... }
```

The status is written to `.build-status.json` in the project root (git-ignored). The playground's `useBuildStatus` hook polls this file to show a yellow (compiling) or green (ready) indicator.
