# Desktop Parity Status

This document tracks web/desktop parity for the Phonograph v1 core playback journeys.

## Core Flow Coverage

- ✅ Discover view runs in desktop shell with Apple/Listen Notes lookups routed through the platform adapter.
- ✅ Library flow runs unchanged in desktop shell via shared app state and reducer logic.
- ✅ Podcast detail view and episode playback run in desktop shell with shared engine/UI code.
- ✅ Playlist and playback controls run in desktop shell via shared player modules.
- ✅ Settings view runs in desktop shell (theme, locale, import/export, reset/reload controls).

## Adapter Boundaries

Desktop-specific behavior is isolated under `src/platform/`:

- `registerServiceWorker`: enabled on web, no-op on desktop.
- `resolveBackendUrl`: keeps feature modules agnostic to runtime origin differences.
- `resolveShareUrl`: ensures share actions from desktop point at the public web URL.

The domain/UI modules (`src/podcast`, `src/core`, `src/engine`, `src/store`) consume adapter functions instead of hard-coding runtime assumptions.

## Known Gaps and Follow-up Issues

1. Native desktop packaging/signing/distribution pipeline is not enabled yet.
   - Follow-up: `DUO-19`
2. Desktop currently depends on hosted Phonograph proxy endpoints unless explicitly configured.
   - Follow-up: `DUO-20`
3. OPML import/export in desktop still uses browser-style controls instead of native dialogs.
   - Follow-up: `DUO-21`
