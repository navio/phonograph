# Framework Best Practices

This document defines Phonograph's baseline standards for framework usage, linting, and quality gates.

## Objectives

- Keep architecture maintainable as web and desktop efforts share more code.
- Catch correctness, accessibility, and security regressions earlier.
- Standardize local and CI quality checks with low-friction developer workflows.

## Tooling Standard

### Biome for linting and formatting

- Biome is now the default code-quality engine.
- Current Phase 1 setup enables **linting** in CI and local workflows.
- Formatting is available but not enforced yet to avoid large churn while the codebase is migrated incrementally.
- Lint scope intentionally targets source and build-config files (not generated `dist/` outputs).

Commands:

```bash
yarn lint
yarn lint:errors
yarn lint:fix
yarn format
yarn format:check
```

## Ruleset Strategy

- `recommended` Biome rules are enabled.
- Existing high-volume rules that currently fail large areas are temporarily set to `warn`:
  - React hook exhaustive dependencies.
  - Some accessibility checks.
  - `dangerouslySetInnerHTML` usage checks.
  - Array index key and iterable callback-return patterns.
- Warnings are tracked and should be reduced over time.

## CI Quality Gates

GitHub Actions uses a unified web+desktop CI pipeline on `main`, `master`, and pull requests:

1. Web quality stage: `yarn typecheck`, `yarn lint:errors`, `yarn test`, and `yarn build`.
2. Pull-request coverage stage: `yarn test:coverage` plus changed-file coverage enforcement.
3. Desktop quality stage (when `src-tauri/tauri.conf.json` exists): Rust compile validation on Linux/macOS/Windows.

The final status summary job enforces one standardized merge-readiness signal across all enabled targets.

## Implementation Guidelines

- Keep business logic in feature/domain modules (`src/podcast`, `src/engine`, `src/store`) and keep components presentational where possible.
- Use small, typed utility functions over duplicated ad-hoc logic.
- Avoid introducing new global mutable state outside the store.
- Prefer explicit async error handling in API/domain boundaries.
- Keep codebase style stable (2-space indentation, semicolons, double quotes) when touching files.

## Adoption Plan

1. Run `yarn lint` in all active feature branches.
2. Convert warning-heavy areas rule-by-rule during regular feature work.
3. Once warnings are materially reduced, enable formatter enforcement and raise selected warning rules back to `error`.
