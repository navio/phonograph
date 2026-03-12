# DUO-25 — Desktop Release + macOS Download Page

## Objective
Ship a user-facing download page for macOS binaries and automate release publishing so links stay stable.

## Scope
1. Add an in-app `/download` route with direct links for:
   - Apple Silicon macOS DMG
   - Intel macOS DMG
2. Add a discoverable entrypoint from Settings.
3. Add CI workflow to build macOS artifacts on semver tags and publish stable asset names.
4. Keep Tauri desktop version aligned with `package.json`.

## Deliverables
- UI route and localized text for desktop downloads.
- Settings card linking users to the download page.
- GitHub Actions release workflow for macOS bundles.
- Version sync utility + bump script update.
- README update describing release flow and download surface.

## Validation
- Typecheck and test suite pass.
- Linting passes.
- New workflow is syntactically valid.
