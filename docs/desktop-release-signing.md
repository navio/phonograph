# Desktop Release Signing Runbook

This document describes the Tauri release signing pipeline introduced for desktop artifact distribution.

## Trigger

The workflow `.github/workflows/desktop-release.yml` runs automatically when a version tag matching `v*` is pushed.

Example:

```bash
git tag v1.4.0
git push origin v1.4.0
```

## Outputs

From the same commit/tag, the pipeline builds and publishes a draft GitHub release with signed artifacts for:

- macOS: `.app`
- Windows: `.msi`, `.nsis`
- Linux: `.deb`, `.AppImage`

## Signing and Notarization Secrets

### macOS code signing + notarization

- `APPLE_CERTIFICATE` (base64-encoded signing certificate)
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_API_ISSUER`
- `APPLE_API_KEY`
- `APPLE_API_PRIVATE_KEY` (private key content for App Store Connect API key)

### Windows code signing

- `TAURI_WINDOWS_CERTIFICATE` (base64-encoded `.pfx`)
- `TAURI_WINDOWS_CERTIFICATE_PASSWORD`

## Validation Guardrail

`scripts/validate-desktop-signing-env.mjs` enforces expected environment variables before packaging.

- In CI tag builds (or when run with `--force`), missing required signing variables fail the build.
- Platform-specific checks run for macOS and Windows workers.

## Local Build Commands

- `yarn desktop:dev`: desktop shell against local Vite dev server.
- `yarn desktop:build`: production desktop bundle.
- `yarn desktop:build:ci`: strict signing validation + desktop bundle.

## Version Parity

Use `yarn desktop:sync-version` to propagate `package.json` version into:

- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

This keeps web and desktop release metadata aligned per tag.
