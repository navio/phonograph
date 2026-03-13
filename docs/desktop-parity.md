# Desktop Parity Status

This document tracks web/desktop parity for the Phonograph v1 playback journeys.

## Core Flow Coverage

- ✅ Discover view runs in desktop shell with Apple/Listen Notes requests resolved through the platform adapter.
- ✅ Library and podcast detail flows run in desktop shell through shared reducer/state modules.
- ✅ Playlist and playback controls run in desktop shell through shared player modules.
- ✅ Settings flow runs in desktop shell, including OPML import/export with native dialogs.

## Adapter Boundaries

Desktop-specific behavior is isolated in `src/platform/`:

- `registerServiceWorker`: enabled on web, no-op on desktop.
- `resolveBackendUrl`: resolves desktop API paths to hosted or configured backend origins.
- `resolveShareUrl`: ensures desktop share links target the public web origin.

Domain/UI modules in `src/podcast`, `src/core`, `src/engine`, and `src/store` consume adapter functions instead of hard-coding runtime assumptions.

## Operational Notes

1. Desktop defaults to `https://phonograph.app` for backend/share origins.
2. Override desktop origins with `VITE_DESKTOP_API_ORIGIN` and `VITE_PUBLIC_WEB_ORIGIN` for staging or self-hosted environments.
3. Desktop signing and notarization pipelines remain a release engineering follow-up.
