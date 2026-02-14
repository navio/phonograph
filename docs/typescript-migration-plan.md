# TypeScript Migration Plan — Phonograph

> **Status:** Draft — awaiting approval before execution  
> **Date:** February 13, 2026  
> **Scope:** Full migration of `src/` (30 files) and `lambda/` (4 files) from JavaScript to TypeScript

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Migration Strategy](#3-migration-strategy)
4. [Phase 0 — Infrastructure Setup](#4-phase-0--infrastructure-setup)
5. [Phase 1 — Foundation Types & Declarations](#5-phase-1--foundation-types--declarations)
6. [Phase 2 — Non-UI Modules (Engine, Reducer, Store)](#6-phase-2--non-ui-modules-engine-reducer-store)
7. [Phase 3 — Core UI Components](#7-phase-3--core-ui-components)
8. [Phase 4 — Feature Modules (Podcast, Discovery)](#8-phase-4--feature-modules-podcast-discovery)
9. [Phase 5 — App Shell & Entry Points](#9-phase-5--app-shell--entry-points)
10. [Phase 6 — Lambda Functions](#10-phase-6--lambda-functions)
11. [Phase 7 — Build Scripts & Config](#11-phase-7--build-scripts--config)
12. [Phase 8 — Cleanup & Strictness](#12-phase-8--cleanup--strictness)
13. [File-by-File Conversion Checklist](#13-file-by-file-conversion-checklist)
14. [Risk Assessment & Mitigations](#14-risk-assessment--mitigations)
15. [Validation Criteria](#15-validation-criteria)

---

## 1. Executive Summary

This plan migrates the Phonograph podcast player from JavaScript (React 19 + Vite 5) to TypeScript. The approach is **bottom-up and incremental**: types flow from leaf modules (constants, utilities) up through the state layer (reducer, store) and finally into React components and the app shell.

**Key numbers:**
- **34 source files** to convert (30 in `src/`, 4 in `lambda/`)
- **3 config/build scripts** to optionally convert (`vite.config.mjs`, `vitest.config.mjs`, `swGenerator.js`)
- **0 existing TypeScript files**, 0 `tsconfig.json`, 0 JSDoc annotations, 0 `.d.ts` files
- **22 React components** (all functional, all using hooks)
- **~4-6 libraries** lacking published types that need custom declarations

**Estimated effort:** 8 phases, each independently buildable and testable.

---

## 2. Current State Assessment

### Tech Stack
| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19.0.0 |
| Build Tool | Vite | 5.x |
| Test Framework | Vitest | 4.x |
| Component Library | MUI | 6.x (ships own types) |
| State Management | Zustand | 5.x (ships own types) |
| Routing | React Router | 5.1.2 (needs `@types/react-router-dom@5`) |
| CSS | MUI `sx` prop + inline styles | — |
| Functions | Netlify Functions (ESM) | — |

### Typing Gaps
- **No TypeScript infrastructure** — everything must be created from scratch.
- **No JSDoc annotations** — zero `@param`, `@returns`, `@type` tags anywhere.
- **PropTypes** — only `Notifications.js` uses them; negligible as a type source.
- **Untyped third-party libs:** `podcastsuite`, `audioqueue`, `colorthief`, `smallfetch`, `randomcolor`.
- **Global augmentations needed:** `window.player` (HTMLAudioElement), Vite's `?worker` import suffix.
- **Anonymous default exports** in 6 components (will need names for proper typing).

### Import/Export Patterns
- 100% ES Modules in `src/` and `lambda/`.
- CommonJS only in `swGenerator.js` and `proxy.js` (root build scripts).
- Vite-specific: `?worker` suffix import, JSON imports, SVG imports, `React.lazy()` with dynamic `import()`.

---

## 3. Migration Strategy

### Approach: Incremental Bottom-Up
1. **`allowJs: true`** in tsconfig so `.js` and `.ts`/`.tsx` coexist during migration.
2. Convert files from **leaves to root** — constants → utilities → state → components → app shell.
3. Each phase produces a **buildable, runnable app** — no big-bang switchover.
4. Start with **`strict: false`** (but enable `noImplicitAny: false` initially), then tighten to full `strict: true` in Phase 8.

### Naming Conventions
- React components with JSX: `.tsx`
- Non-JSX TypeScript: `.ts`
- Type definition files: `src/types/` directory
- Custom ambient declarations: `src/types/*.d.ts`

### Commit Strategy
- One commit per logical unit (infrastructure, each module group, etc.).
- Each commit must pass `tsc --noEmit` and `yarn build`.

---

## 4. Phase 0 — Infrastructure Setup

### 4.1 Install TypeScript & Type Packages

```bash
yarn add -D typescript @types/react @types/react-dom @types/react-router-dom@5 @types/dompurify @types/node
```

> **Note:** `@types/react-router-dom` must be pinned to **v5.x** to match the installed `react-router-dom@5.1.2`. Version 6+ types are incompatible.

### 4.2 Create `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    // Language
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable", "WebWorker"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",

    // Paths
    "baseUrl": ".",
    "paths": {
      "public/*": ["./public/*"]
    },
    "outDir": "./dist",
    "rootDir": ".",

    // Interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // Type checking (relaxed initially, tightened in Phase 8)
    "strict": false,
    "noImplicitAny": false,
    "allowJs": true,
    "skipLibCheck": true,

    // Emit
    "noEmit": true,
    "declaration": false
  },
  "include": ["src/**/*", "lambda/**/*", "src/types/**/*"],
  "exclude": ["node_modules", "dist", "public"]
}
```

### 4.3 Create `tsconfig.node.json` (for build scripts)

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowJs": true,
    "noEmit": true
  },
  "include": ["swGenerator.js", "vite.config.mjs", "vitest.config.mjs"]
}
```

### 4.4 Update Vite Config

Remove the JSX-in-`.js` workaround (no longer needed once files are `.tsx`):

```diff
- esbuild: {
-   loader: 'jsx',
-   include: /src\/.*\.js$/,
-   exclude: []
- },
  optimizeDeps: {
    esbuildOptions: {
-     loader: {
-       '.js': 'jsx'
-     },
      plugins: [
        NodeGlobalsPolyfillPlugin({ process: true, buffer: true }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
```

> **Important:** This change happens **after** all `.js` files containing JSX are renamed to `.tsx`. During the migration (Phases 1-7), keep this config so unconverted `.js` files still work.

### 4.5 Update `index.html`

```diff
- <script type="module" src="/src/index.js"></script>
+ <script type="module" src="/src/index.tsx"></script>
```

> **Note:** Do this only when `src/index.js` is actually renamed in Phase 5.

### 4.6 Update Vitest Config

```diff
  test: {
    environment: "node",
-   include: ["src/**/*.test.js"],
+   include: ["src/**/*.test.{js,ts,tsx}"],
  },
```

### 4.7 Add NPM Scripts

```jsonc
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    // ... existing scripts unchanged
  }
}
```

### 4.8 Validation
- [ ] `yarn typecheck` runs without config errors (file errors are expected/OK)
- [ ] `yarn dev` still works with existing `.js` files
- [ ] `yarn build` still produces working output

---

## 5. Phase 1 — Foundation Types & Declarations

### 5.1 Create `src/types/` directory

### 5.2 Create `src/types/app.ts` — Core Application Types

```typescript
// -- State Types --
export interface EpisodeInfo {
  title: string;
  guid: string;
  description?: string;
  pubDate?: string;
  duration?: number;
  media?: string;
  currentTime?: number;
  [key: string]: unknown;  // allow extension
}

export interface PodcastEntry {
  feed: string;
  title?: string;
  image?: string;
  author?: string;
  [key: string]: unknown;
}

export interface PlaylistItem {
  media: string;
  currentTime?: number;
  episode?: string;
  episodeInfo?: EpisodeInfo;
  podcastImage?: string;
  title?: string;
  author?: string;
  audioOrigin?: string;
  [key: string]: unknown;
}

export interface AppState {
  podcasts: PodcastEntry[];
  theme: boolean | "dark" | "light" | "os";
  current: string | null;

  status: "playing" | "paused" | null;
  playing: string | null;
  loaded: number;
  played: number;
  audioOrigin: string;
  loading: boolean;

  title: string;
  image: string | null;
  episode: string | null;
  episodeInfo: EpisodeInfo | null;

  playlist: PlaylistItem[];

  currentTime: number | null;
  duration?: number;
  media: string;
  refresh: number;

  // UI state
  drawer?: boolean;
  drawerContent?: unknown;

  // Dynamic podcast fields
  podcastImage?: string;
  podcastAuthor?: string;
  [key: string]: unknown;
}

// -- Action Types --
export type AppAction =
  | { type: "updatePodcasts"; podcasts: PodcastEntry[] }
  | { type: "initLibrary"; podcasts: PodcastEntry[] }
  | { type: "loadPodcast"; payload: string }
  | { type: "setDark"; payload: boolean | "dark" | "light" | "os" }
  | { type: "playingStatus"; status: "playing" | "paused" }
  | { type: "updateCurrent"; payload: string }
  | { type: "addNext"; payload: PlaylistItem }
  | { type: "addLast"; payload: PlaylistItem }
  | { type: "audioCompleted" }
  | { type: "audioUpdate"; payload: Partial<AppState> }
  | { type: "removeFromPlayList"; episode: number }
  | { type: "clearPlayList" }
  | { type: "resetState" }
  | { type: "drawer"; payload?: { status: boolean; drawerContent?: unknown } };

// -- Context Type --
export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => void;
  engine: unknown;  // PodcastSuite engine (typed when podcastsuite gets types)
  debug: boolean;
  worker: Worker;
  player: HTMLAudioElement | null;
  playerRef: React.RefObject<HTMLAudioElement | null>;
}

// -- Player Functions --
export interface PlayerFunctions {
  playButton: () => void;
  rewind10Seconds: () => void;
  forward30Seconds: () => void;
  seek: (time: number) => void;
}
```

### 5.3 Create `src/types/globals.d.ts` — Global Augmentations

```typescript
// Extend Window for the global player reference
interface Window {
  player: HTMLAudioElement;
}

// Vite Worker import suffix
declare module "*?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

// SVG imports
declare module "*.svg" {
  const src: string;
  export default src;
}
```

### 5.4 Create `src/types/vendor.d.ts` — Third-Party Ambient Declarations

```typescript
// Libraries without published @types packages

declare module "podcastsuite" {
  interface Database {
    get(key: string): Promise<Record<string, unknown> | undefined>;
    set(key: string, value: unknown): Promise<void>;
  }
  interface PodcastSuite {
    createDatabase(name: string, store: string): Database;
    // Add more signatures as discovered during conversion
    [key: string]: unknown;
  }
  const PS: PodcastSuite;
  export default PS;
}

declare module "audioqueue" {
  const audioqueue: unknown;
  export default audioqueue;
}

declare module "colorthief" {
  export default class ColorThief {
    getColor(img: HTMLImageElement, quality?: number): [number, number, number];
    getPalette(img: HTMLImageElement, colorCount?: number, quality?: number): [number, number, number][];
  }
}

declare module "smallfetch" {
  function smallfetch(url: string, options?: RequestInit): Promise<Response>;
  export default smallfetch;
}

declare module "randomcolor" {
  interface Options {
    hue?: string | number;
    luminosity?: "bright" | "light" | "dark" | "random";
    count?: number;
    seed?: number | string;
    format?: string;
    alpha?: number;
  }
  function randomColor(options?: Options): string;
  export default randomColor;
}
```

### 5.5 Validation
- [ ] `yarn typecheck` still runs (no new config errors)
- [ ] Types compile cleanly: `tsc --noEmit` on `src/types/` only

---

## 6. Phase 2 — Non-UI Modules (Engine, Reducer, Store)

Convert files that have **no JSX** — these become `.ts` (not `.tsx`).

### Files in this phase (8 files):

| # | File | Rename To | Key Typing Work |
|---|---|---|---|
| 1 | `src/constants.js` | `src/constants.ts` | Add `as const` to route strings |
| 2 | `src/podcast.js` | `src/podcast.ts` | Type podcast feed URL arrays |
| 3 | `src/theme.js` | `src/theme.ts` | Type MUI theme object |
| 4 | `src/reducer.js` | `src/reducer.ts` | Apply `AppState`, `AppAction` types; type all exported functions |
| 5 | `src/store/appStore.js` | `src/store/appStore.ts` | Type Zustand store with `AppState`, `AppAction` |
| 6 | `src/engine/index.js` | `src/engine/index.ts` | Type engine factory, library initialization |
| 7 | `src/engine/player.js` | `src/engine/player.ts` | Type `PlayerFunctions` return |
| 8 | `src/engine/events.js` | `src/engine/events.ts` | Type event handler attachment |

### Conversion Order & Rationale
1. **`constants.ts`** — zero dependencies, used everywhere. Simple `as const` assertions.
2. **`podcast.ts`** — zero deps, just data arrays.
3. **`theme.ts`** — depends only on MUI (already typed).
4. **`reducer.ts`** — depends on `podcastsuite` (ambient declaration ready). Core state types applied here.
5. **`appStore.ts`** — depends on `reducer.ts`. Zustand generics applied.
6. **`engine/player.ts`** — depends only on DOM types.
7. **`engine/events.ts`** — depends only on DOM types + `AppAction`.
8. **`engine/index.ts`** — depends on `podcastsuite`, store.

### Validation
- [ ] `yarn typecheck` passes for all Phase 2 files
- [ ] `yarn dev` works — app loads and plays audio
- [ ] `yarn test` passes (store tests)

---

## 7. Phase 3 — Core UI Components

Convert `src/core/` components. These become `.tsx`.

### Files in this phase (10 files):

| # | File | Rename To | Key Typing Work |
|---|---|---|---|
| 1 | `src/engine/useOnline.js` | `src/engine/useOnline.ts` | Simple hook, return type `boolean` |
| 2 | `src/core/podcastPalette.js` | `src/core/podcastPalette.ts` | Type color utility functions |
| 3 | `src/core/Loading.js` | `src/core/Loading.tsx` | Name the anonymous export; type props |
| 4 | `src/core/Notifications.js` | `src/core/Notifications.tsx` | Replace PropTypes with TS interface; remove `prop-types` dep |
| 5 | `src/core/Header.js` | `src/core/Header.tsx` | Type props (minimal component) |
| 6 | `src/core/SleepTimer.js` | `src/core/SleepTimer.tsx` | Name anonymous export; type `{onClick, color}` props |
| 7 | `src/core/SpeedControl.js` | `src/core/SpeedControl.tsx` | Name anonymous export; type `{onClick, color}` props |
| 8 | `src/core/Footer.js` | `src/core/Footer.tsx` | Type styled components and navigation props |
| 9 | `src/core/Playlist.js` | `src/core/Playlist.tsx` | Type playlist items from `AppState` |
| 10 | `src/core/Drawer.js` | `src/core/Drawer.tsx` | Name anonymous export; type drawer state |
| 11 | `src/core/MediaControl.js` | `src/core/MediaControl.tsx` | Largest component (~475 lines); type all player props and internal state |

### Conversion Notes
- **Anonymous default exports** (`Drawer.js`, `Loading.js`, `SleepTimer.js`, `SpeedControl.js`) must be given named function declarations for proper TypeScript component typing.
- **`Notifications.js`** is the only file using `prop-types` — after conversion, remove the `prop-types` import and consider removing the package from `package.json`.
- **`MediaControl.js`** is the most complex component; convert it last in this phase.

### Validation
- [ ] `yarn typecheck` passes for all Phase 3 files
- [ ] `yarn dev` works — all UI components render correctly
- [ ] Drawer, playlist, media controls, sleep timer, speed control all function

---

## 8. Phase 4 — Feature Modules (Podcast, Discovery)

Convert `src/podcast/` components and utilities.

### Files in this phase (9 files):

| # | File | Rename To | Key Typing Work |
|---|---|---|---|
| 1 | `src/podcast/Discovery/PodcastSearcher.js` | `src/podcast/Discovery/PodcastSearcher.ts` | Type the ES6 class, search results |
| 2 | `src/podcast/Discovery/engine.js` | `src/podcast/Discovery/engine.ts` | Type search/trending fetch functions |
| 3 | `src/podcast/Discovery/Search.js` | `src/podcast/Discovery/Search.tsx` | Name anonymous export; type search props |
| 4 | `src/podcast/Discovery/Geners.js` | `src/podcast/Discovery/Geners.tsx` | Name anonymous export; type genre data, chips |
| 5 | `src/podcast/Discovery/index.js` | `src/podcast/Discovery/index.tsx` | Type Discover page props and internal components |
| 6 | `src/podcast/Library.js` | `src/podcast/Library.tsx` | Type library grid props |
| 7 | `src/podcast/Settings.js` | `src/podcast/Settings.tsx` | Type settings props (version import) |
| 8 | `src/podcast/PodcastView/PodcastHeader.js` | `src/podcast/PodcastView/PodcastHeader.tsx` | Type podcast header props |
| 9 | `src/podcast/PodcastView/EpisodeList.js` | `src/podcast/PodcastView/EpisodeList.tsx` | Type episode data and list props |
| 10 | `src/podcast/PodcastView/index.js` | `src/podcast/PodcastView/index.tsx` | Name anonymous export; type podcast view |

### Conversion Notes
- **`PodcastSearcher.ts`** is the only class in the codebase — use standard TS class typing with public/private.
- **`Geners.js`** dynamically imports `genres.json` — ensure `resolveJsonModule` works with dynamic import.
- **`Settings.js`** imports `../../package.json` — already handled by `resolveJsonModule`.

### Validation
- [ ] `yarn typecheck` passes for all Phase 4 files
- [ ] `yarn dev` works — Discovery, Library, PodcastView, Settings all render and function
- [ ] Search, genre filtering, podcast loading all work

---

## 9. Phase 5 — App Shell & Entry Points

Convert the app root and service worker registration.

### Files in this phase (4 files):

| # | File | Rename To | Key Typing Work |
|---|---|---|---|
| 1 | `src/serviceworker/worker.js` | `src/serviceworker/worker.ts` | Type Web Worker message handling |
| 2 | `src/serviceworker/index.js` | `src/serviceworker/index.ts` | Type SW registration |
| 3 | `src/App.js` | `src/App.tsx` | Type `AppContext`, lazy imports, all props |
| 4 | `src/index.js` | `src/index.tsx` | Type React root creation |

### Critical Steps
1. When `src/index.js` → `src/index.tsx`, **update `index.html`** to reference `/src/index.tsx`.
2. `AppContext` gets typed with `AppContextValue` from `src/types/app.ts`.
3. After this phase, **remove the JSX-in-`.js` workaround from `vite.config.mjs`** (no more `.js` files with JSX exist).

### Validation
- [ ] `yarn typecheck` passes with zero errors on all `src/` files
- [ ] `yarn dev` works end-to-end
- [ ] `yarn build` produces working production build
- [ ] Service worker registers correctly

---

## 10. Phase 6 — Lambda Functions

Convert Netlify Functions from `.js` to `.ts`.

### Files in this phase (4 files):

| # | File | Rename To | Key Typing Work |
|---|---|---|---|
| 1 | `lambda/findCast.js` | `lambda/findCast.ts` | Type Netlify handler, request/response |
| 2 | `lambda/findFinal.js` | `lambda/findFinal.ts` | Type URL resolution handler |
| 3 | `lambda/appleSearch.js` | `lambda/appleSearch.ts` | Type Apple API proxy handler |
| 4 | `lambda/listenNotesProxy.js` | `lambda/listenNotesProxy.ts` | Type Listen Notes proxy handler |

### Additional Dependencies
```bash
yarn add -D @netlify/functions  # For handler type definitions
```

### Notes
- Lambda functions use `node-fetch` v2 — types come with `@types/node-fetch` (install if needed, though v2 may have bundled types).
- Each function exports `{ handler }` — type as `Handler` from `@netlify/functions`.
- Netlify CLI must support `.ts` function files, or we add a compile step. Verify with `yarn lambda:build`.

### Validation
- [ ] `yarn lambda:build` succeeds
- [ ] `yarn lambda:serve` starts without errors
- [ ] Function endpoints respond correctly in dev

---

## 11. Phase 7 — Build Scripts & Config

Optionally convert root-level Node scripts.

| # | File | Action | Notes |
|---|---|---|---|
| 1 | `vite.config.mjs` | Rename to `vite.config.ts` | Vite natively supports `.ts` config |
| 2 | `vitest.config.mjs` | Rename to `vitest.config.ts` | Vitest natively supports `.ts` config |
| 3 | `swGenerator.js` | Rename to `swGenerator.ts` | Uses CommonJS `require()` — convert to ESM or use `ts-node` |
| 4 | `proxy.js` | Leave as `.js` or delete | Legacy/unused file |

### Notes
- This phase is **optional** — these files run in Node, not in the browser, and Vite/Vitest already support JS configs.
- If converting `swGenerator.js`, update the `sw` script in `package.json` to use `tsx` or `ts-node`.

### Validation
- [ ] `yarn dev` works
- [ ] `yarn build` works
- [ ] `yarn sw` works (if swGenerator was converted)

---

## 12. Phase 8 — Cleanup & Strictness

### 8.1 Enable Strict Mode

Update `tsconfig.json`:

```diff
- "strict": false,
- "noImplicitAny": false,
+ "strict": true,
```

This enables:
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`
- `alwaysStrict`

### 8.2 Fix All Strict-Mode Errors

Expect errors primarily in:
- **Null checks** — `state.episodeInfo.title` without `?.` guard
- **Implicit `any`** — untyped function parameters, `useContext` without generic
- **Index signatures** — `AppState` dynamic property access

### 8.3 Remove `allowJs`

```diff
- "allowJs": true,
```

Verify no `.js` files remain in `src/` or `lambda/`.

### 8.4 Remove Legacy Dependencies

```bash
yarn remove prop-types babel-plugin-transform-object-rest-spread
```

### 8.5 Remove Vite JSX-in-JS Workaround

If not already done in Phase 5, remove the `esbuild.loader` and `optimizeDeps.esbuildOptions.loader` entries from `vite.config`.

### 8.6 Final Validation
- [ ] `tsc --noEmit` passes with **zero errors** under `strict: true`
- [ ] `yarn dev` — full smoke test of all features
- [ ] `yarn build` — production build succeeds
- [ ] `yarn test` — all tests pass
- [ ] `yarn lambda:build` — lambda functions build
- [ ] No `.js` source files remain in `src/` or `lambda/`

---

## 13. File-by-File Conversion Checklist

### `src/` — 30 files

| Phase | Original File | Target File | Status |
|---|---|---|---|
| 2 | `src/constants.js` | `src/constants.ts` | ☐ |
| 2 | `src/podcast.js` | `src/podcast.ts` | ☐ |
| 2 | `src/theme.js` | `src/theme.ts` | ☐ |
| 2 | `src/reducer.js` | `src/reducer.ts` | ☐ |
| 2 | `src/store/appStore.js` | `src/store/appStore.ts` | ☐ |
| 2 | `src/store/appStore.test.js` | `src/store/appStore.test.ts` | ☐ |
| 2 | `src/engine/index.js` | `src/engine/index.ts` | ☐ |
| 2 | `src/engine/player.js` | `src/engine/player.ts` | ☐ |
| 2 | `src/engine/events.js` | `src/engine/events.ts` | ☐ |
| 3 | `src/engine/useOnline.js` | `src/engine/useOnline.ts` | ☐ |
| 3 | `src/core/podcastPalette.js` | `src/core/podcastPalette.ts` | ☐ |
| 3 | `src/core/Loading.js` | `src/core/Loading.tsx` | ☐ |
| 3 | `src/core/Notifications.js` | `src/core/Notifications.tsx` | ☐ |
| 3 | `src/core/Header.js` | `src/core/Header.tsx` | ☐ |
| 3 | `src/core/SleepTimer.js` | `src/core/SleepTimer.tsx` | ☐ |
| 3 | `src/core/SpeedControl.js` | `src/core/SpeedControl.tsx` | ☐ |
| 3 | `src/core/Footer.js` | `src/core/Footer.tsx` | ☐ |
| 3 | `src/core/Playlist.js` | `src/core/Playlist.tsx` | ☐ |
| 3 | `src/core/Drawer.js` | `src/core/Drawer.tsx` | ☐ |
| 3 | `src/core/MediaControl.js` | `src/core/MediaControl.tsx` | ☐ |
| 4 | `src/podcast/Discovery/PodcastSearcher.js` | `src/podcast/Discovery/PodcastSearcher.ts` | ☐ |
| 4 | `src/podcast/Discovery/engine.js` | `src/podcast/Discovery/engine.ts` | ☐ |
| 4 | `src/podcast/Discovery/Search.js` | `src/podcast/Discovery/Search.tsx` | ☐ |
| 4 | `src/podcast/Discovery/Geners.js` | `src/podcast/Discovery/Geners.tsx` | ☐ |
| 4 | `src/podcast/Discovery/index.js` | `src/podcast/Discovery/index.tsx` | ☐ |
| 4 | `src/podcast/Library.js` | `src/podcast/Library.tsx` | ☐ |
| 4 | `src/podcast/Settings.js` | `src/podcast/Settings.tsx` | ☐ |
| 4 | `src/podcast/PodcastView/PodcastHeader.js` | `src/podcast/PodcastView/PodcastHeader.tsx` | ☐ |
| 4 | `src/podcast/PodcastView/EpisodeList.js` | `src/podcast/PodcastView/EpisodeList.tsx` | ☐ |
| 4 | `src/podcast/PodcastView/index.js` | `src/podcast/PodcastView/index.tsx` | ☐ |
| 5 | `src/serviceworker/worker.js` | `src/serviceworker/worker.ts` | ☐ |
| 5 | `src/serviceworker/index.js` | `src/serviceworker/index.ts` | ☐ |
| 5 | `src/App.js` | `src/App.tsx` | ☐ |
| 5 | `src/index.js` | `src/index.tsx` | ☐ |

### `lambda/` — 4 files

| Phase | Original File | Target File | Status |
|---|---|---|---|
| 6 | `lambda/findCast.js` | `lambda/findCast.ts` | ☐ |
| 6 | `lambda/findFinal.js` | `lambda/findFinal.ts` | ☐ |
| 6 | `lambda/appleSearch.js` | `lambda/appleSearch.ts` | ☐ |
| 6 | `lambda/listenNotesProxy.js` | `lambda/listenNotesProxy.ts` | ☐ |

### Root config — 3 files (optional)

| Phase | Original File | Target File | Status |
|---|---|---|---|
| 7 | `vite.config.mjs` | `vite.config.ts` | ☐ |
| 7 | `vitest.config.mjs` | `vitest.config.ts` | ☐ |
| 7 | `swGenerator.js` | `swGenerator.ts` | ☐ |

---

## 14. Risk Assessment & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **`podcastsuite` has complex untyped API** | High | Medium | Start with permissive ambient declarations (`[key: string]: unknown`); refine iteratively |
| **React Router v5 types mismatch** | Medium | Medium | Pin `@types/react-router-dom@5.3.x`; test `useHistory`, `useLocation`, `Route render` patterns |
| **Netlify CLI doesn't build `.ts` functions** | Medium | High | If so, add a pre-build step with `tsc` or `esbuild` to compile lambda to JS before `netlify functions:build` |
| **Vite `?worker` import breaks with TS** | Low | Medium | Ambient declaration in `globals.d.ts` handles this; test early in Phase 0 |
| **`window.player` global pattern** | Low | Low | Window interface augmentation in `globals.d.ts`; consider refactoring to pass via context |
| **`strict: true` reveals many errors** | High | Low | Deferred to Phase 8; fix incrementally; the app works throughout |
| **Dynamic `import()` paths confuse TS** | Low | Low | Vite handles these at build time; TS `noEmit` skips emit-time resolution |
| **Test file conversion breaks Vitest** | Low | Low | Vitest supports `.ts` natively; config already updated in Phase 0 |

---

## 15. Validation Criteria

### Per-Phase Gates (must pass before moving to next phase)

| Check | Command | Expected |
|---|---|---|
| Type check | `yarn typecheck` | 0 errors (or only in unconverted files) |
| Dev server | `yarn dev` | App loads, navigates, plays audio |
| Production build | `yarn build` | Completes without errors |
| Tests | `yarn test` | All tests pass |
| Lambda build | `yarn lambda:build` | Functions bundle successfully |

### Final Acceptance Criteria (after Phase 8)

- [ ] **Zero `.js` source files** in `src/` and `lambda/`
- [ ] **`tsc --noEmit` with `strict: true`** passes with 0 errors
- [ ] **`yarn build`** produces working production bundle
- [ ] **`yarn dev`** — full feature smoke test:
  - [ ] Discovery page loads, search works
  - [ ] Genre filtering works
  - [ ] Podcast detail view loads episodes
  - [ ] Audio playback works (play, pause, seek, skip)
  - [ ] Playlist management works (add, remove, reorder)
  - [ ] Library view shows saved podcasts
  - [ ] Settings page renders with version info
  - [ ] Sleep timer and speed control function
  - [ ] Dark/light/OS theme switching works
  - [ ] Service worker registers
  - [ ] Drawer opens and closes
  - [ ] Notifications display
- [ ] **`yarn test`** — all tests pass
- [ ] **`yarn lambda:serve`** — all 4 function endpoints respond
- [ ] **`prop-types` package removed** from dependencies
- [ ] **No `// @ts-ignore` or `// @ts-expect-error`** comments (or each one is documented with a reason)

---

## Appendix: New Files Created

| File | Purpose |
|---|---|
| `tsconfig.json` | Main TypeScript configuration |
| `tsconfig.node.json` | Node scripts TypeScript configuration |
| `src/types/app.ts` | Core application type definitions (AppState, AppAction, AppContextValue, etc.) |
| `src/types/globals.d.ts` | Window augmentation, Vite module declarations (worker, SVG) |
| `src/types/vendor.d.ts` | Ambient declarations for untyped third-party packages |

---

*This plan is ready for review. Please approve or request changes before execution begins.*
