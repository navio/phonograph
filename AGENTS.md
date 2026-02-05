# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React app (JSX-in-.js). Key areas: `core/`, `engine/` (player, events), `podcast/`, `serviceworker/`, `App.js`, `index.js`.
- `lambda/`: Netlify Functions (`findCast.js`, `findFinal.js`) and manifest; built via Netlify CLI.
- `public/`: static assets and HTML shell; copied to `dist/` on build.
- `dist/`: production build output.
- Root config: `vite.config.mjs` (Vite + proxies), `netlify.toml` (deploy + redirects), `swGenerator.js`, `filegetter.sh`.

## Build, Test, and Development Commands
- `yarn install`: install dependencies.
- `yarn dev`: run Vite (http://localhost:1234) and Netlify Functions (http://localhost:9999) together.
- `yarn start`: run Vite only (no functions).
- `yarn build`: fetch assets, build app, copy SEO files, generate service worker, and build functions → `dist/`.
- `yarn serve`: preview the production build locally.
- Functions: `yarn lambda:serve` (dev) and `yarn lambda:build` (bundle).
- Examples: `curl 'http://localhost:1234/rss-full?term=test'` (dev proxy → `findCast`).

## Coding Style & Naming Conventions
- JavaScript/React 17 with hooks; JSX lives in `.js` (configured in Vite).
- Indentation 2 spaces; use semicolons and double quotes.
- Components/files: PascalCase for UI components (`PodcastView.js`), lowercase for folders/modules (`core/`, `engine/`).
- Keep functions pure and small; prefer functional components; colocate feature code under `src/podcast` or `src/core`.

## Testing Guidelines
- No formal test suite is configured. Use manual smoke tests:
  - Start dev (`yarn dev`), navigate app flows, play audio, and verify service worker registration.
  - Hit function endpoints via the dev server (e.g., `/rss-full?term=…`).
- If you add complex logic, include lightweight unit tests and document how to run them.

## Commit & Pull Request Guidelines
- Conventional Commits via Commitizen: `npx cz` to compose messages.
- Commits: small, focused; include rationale in body when needed.
- PRs: clear description, linked issues, test steps, and screenshots/GIFs for UI changes. Note any config/env changes.

## Security & Configuration Tips
- Dev env: set `listennotes` API key (e.g., `listennotes=YOUR_KEY yarn dev`). Use Netlify env vars in production.
- Avoid committing secrets; prefer `.env` (excluded) or Netlify UI for sensitive values.
