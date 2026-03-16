# Phonograph

Phonograph is a production Progressive Web App focused on audio playback, currently centered on podcasts.
It combines a modern React frontend, a resilient browser playback engine, and Netlify function proxies for third-party APIs.

[![Netlify Status](https://api.netlify.com/api/v1/badges/1470601f-7cda-4bb0-a5c6-8e56cf171e40/deploy-status)](https://app.netlify.com/sites/player/deploys)

**Production URL:** https://phonograph.app

**User manual:** https://phonograph.app/docs/

## Mission

Deliver a first-class, fast, and reliable audio experience on the web with strong mobile/PWA behavior.

## Vision

Evolve Phonograph from a podcast-first player into a flexible audio platform where additional audio experiences can be integrated behind a shared playback and offline-capable core.

## What It Does Today

- Discover podcasts through curated and searchable sources.
- Save podcasts into a personal library and revisit episodes quickly.
- Play audio with playlist controls and per-podcast playback preferences.
- Run as a PWA with service worker registration and cached assets.
- Proxy third-party APIs through Netlify Functions for consistency and deployment control.

## Architecture

Phonograph is organized around a client runtime and a lightweight serverless proxy layer.

### 1) Client Runtime (Vite + React + TypeScript)

- **Entry point:** `src/index.tsx`
  - Boots React 19, internationalization wrapper, router, and service worker registration.
- **App shell:** `src/App.tsx`
  - Sets routes (`/discover`, `/library`, `/podcast`, `/playlist`, `/settings`).
  - Lazily loads heavy views for better startup performance.
  - Initializes playback engine, event wiring, and background worker refresh.
- **UI system:** Material UI (`@mui/material`) with app theming in `src/theme.ts`.

### 2) State and Playback Engine

- **State store:** Zustand store in `src/store/appStore.ts`.
  - Reducer-style dispatch for predictable state transitions.
  - Persists app state in `localStorage`.
- **Reducer logic:** `src/reducer.ts`
  - Handles library updates, playback status, queue changes, and settings updates.
- **Playback control:** `src/engine/player.ts` + `src/engine/events.ts`
  - Drives `HTMLAudioElement` behavior.
  - Integrates Media Session actions for OS-level play/pause support.
  - Tracks progress, buffering, completion, and per-podcast skip/speed preferences.

### 3) Podcast Domain Layer

- **Podcast engine wrapper:** `src/engine/index.ts` + `src/podcast.ts`.
- **Core feature areas:**
  - Discovery: `src/podcast/Discovery/`
  - Library: `src/podcast/Library.tsx`
  - Episode/podcast detail views: `src/podcast/PodcastView/`
  - Settings/import support: `src/podcast/Settings.tsx`, `src/podcast/opmlImporter.ts`

### 4) Background and Offline Behavior

- **Service worker registration:** `src/serviceworker/index.ts`
- **Worker refresh loop:** `src/serviceworker/worker.ts`
  - Uses the podcast engine in a worker context to refresh library metadata in the background.
- **Build-time SW patching:** `swGenerator.js`
  - Rewrites the generated `service-worker.js` precache list from actual `dist/` assets.

### 5) Serverless Proxy Layer (Netlify Functions)

Located in `lambda/` and routed via `netlify.toml`:

- `findCast.ts`: RSS fetch proxy
- `findFinal.ts`: URL resolution proxy
- `apple.ts` and `appleSearch.ts`: Apple/iTunes search and metadata proxying
- `listenNotesProxy.ts`: Listen Notes API proxy with selective CDN caching

This layer avoids exposing provider details directly in the client and centralizes API behavior.

## Frameworks and Key Technologies

- **Frontend:** React 19, React Router v5, Material UI v6
- **Build tooling:** Vite 5, TypeScript 5
- **State management:** Zustand
- **Audio/podcast utilities:** `podcastsuite`, `audioqueue`
- **Serverless runtime:** Netlify Functions (`@netlify/functions`)
- **Testing:** Vitest
- **Deployment:** Netlify

## Project Structure

```text
src/
  core/            # Shared UI + playback controls
  engine/          # Audio engine wiring and events
  i18n/            # Internationalization wrappers/messages
  platform/        # Runtime abstraction (web + tauri adapters)
  podcast/         # Podcast discovery/library/view features
  serviceworker/   # SW registration + web worker logic
  store/           # Zustand store
  App.tsx
  index.tsx

lambda/            # Netlify Functions
src-tauri/         # Tauri desktop host (Rust + tauri.conf)
public/            # Static assets copied to dist/
dist/              # Production build output
docs/              # Planning and migration docs
manuals/           # User-facing manual source (VitePress)
```

## Local Development

### Prerequisites

- Node.js 20+
- Yarn
- Rust toolchain (`rustup`)
- Tauri CLI (installed via `yarn install`)

### Install

```bash
yarn install
```

### Run full local stack (app + functions)

```bash
listennotes=YOUR_API_KEY yarn dev
```

This starts:

- Vite app on `http://localhost:1234`
- Netlify functions on `http://localhost:9999`

### Run frontend only

```bash
yarn start
```

### Run desktop shell (Tauri)

```bash
yarn desktop:dev
```

Build desktop bundles:

```bash
yarn desktop:build
```

### Desktop release + download links

- Pushing a semver tag (for example `v1.3.24`) triggers `.github/workflows/desktop-release-macos.yml`.
- The workflow publishes two stable assets to the GitHub release:
  - `Phonograph-macOS-Apple-Silicon.dmg`
  - `Phonograph-macOS-Intel.dmg`
- The app exposes an in-product download screen at `/download` and a shortcut from **Settings → Desktop App**.

## Build and Preview

```bash
yarn build
yarn serve
```

Build manuals only:

```bash
yarn docs:manuals:build
```

Run manuals locally:

```bash
yarn docs:manuals:dev
```

Build pipeline (`yarn build`) includes:

1. Fetching discovery JSON assets (`filegetter.sh`)
2. Vite production build
3. SEO/static file copy
4. Service worker precache rewrite
5. User manual static build to `/dist/docs`
6. Netlify function build

## Environment Variables

- `LISTEN_NOTES_API_KEY` (preferred)
- `LISTENNOTES` / `listennotes` (backward-compatible alternatives)

These are used for discovery/proxy calls that depend on Listen Notes.

## Quality and Testing

Run tests with:

```bash
yarn test
```

Run coverage locally with:

```bash
yarn test:coverage
```

Validate the pull-request changed-file coverage gate (70% minimum across lines/functions/branches/statements):

```bash
COVERAGE_BASE_REF=origin/master yarn coverage:changed
```

Run lint checks with:

```bash
yarn lint
yarn lint:errors
```

Run the local quality gate sequence with:

```bash
yarn quality
```

PR CI now enforces a dual-surface quality matrix:

- `web-quality`: typecheck, lint, test, and production web bundle build.
- `desktop-compile`: desktop compile smoke validation when `src-tauri/` is present.
- `desktop-package-smoke`: unsigned desktop package smoke build and artifact upload for QA.
- `merge-gate`: fails when any required web/desktop check fails.

Desktop smoke artifacts are published as `desktop-unsigned-<run_id>` in the Actions run.

Unified release automation runs in `.github/workflows/unified-release.yml` and produces:

- `phonograph-web-vX.Y.Z.tar.gz` plus SHA-256 checksum from the web `dist/` build.
- Tauri desktop installers for Linux, macOS, and Windows when `src-tauri/` is present.
- One shared GitHub release with per-stage workflow summaries.

Tag pushes trigger release publication:

```bash
git tag v1.3.25
git push origin v1.3.25
```

Framework and linting standards are documented in `docs/framework-best-practices.md`.
Current repository includes targeted tests for reducers, engine events, app store behavior, and podcast utilities.

## Roadmap Direction

- Continue hardening offline playback and sync behavior.
- Keep improving provider abstraction in function proxies.
- Expand audio-platform extensibility beyond podcasts.
- Continue TypeScript and test coverage improvements where needed.
