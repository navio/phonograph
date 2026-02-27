# ASSIGNMENT: Phonograph — i18n Phase 1

Objective

Implement Phase 1 of internationalization for the Phonograph app to provide basic English (fallback) and Spanish translations, automatic browser detection, and a minimal language selector in Settings. Keep the change small, safe, and testable.

Scope (explicit checklist)

- Install runtime packages:
  - i18next
  - react-i18next
  - i18next-browser-languagedetector
- Create src/i18n.ts with i18next initialization:
  - wire initReactI18next
  - enable i18next-browser-languagedetector and cache selection to localStorage
  - add resources for `en` (fallback) and `es`
  - set fallbackLng to `en`
- Wire the React provider at the app root:
  - Wrap the app with <I18nextProvider i18n={i18n}> in src/index.tsx
- Add locale files under src/locales/{en,es}/translation.json
- Persist language choice to localStorage (detector caches localStorage key `i18nextLng`)
- Add a minimal language dropdown to the Settings screen (src/podcast/Settings.tsx):
  - use react-i18next's `useTranslation()` to `t()` and `changeLanguage()`
  - persist selection (i18next detector + localStorage)
- Translate the Settings title and a few visible labels as proof (e.g., Settings title, Configurations, Theme Selector, Enable Podcast View, Import/Export labels)

Constraints / Non-negotiables

- Keep the PR small and focused to Phase 1 only.
- Do not refactor existing UI beyond the minimal changes required to add the dropdown and translations.
- Ensure the app builds successfully (run the build pipeline locally before opening a PR).
- Commit logically (small, reviewable commits).

Developer checklist (recommended commit steps)

1. Create and checkout worktree/branch: `wtp add -b phonograph-i18n-phase-1` (worktree path `/Users/alnavarro/Development/worktrees/phonograph-i18n-phase-1`).
2. Add dependencies and update lockfile (use package manager in repo).
3. Add `src/i18n.ts` + `src/locales/{en,es}/translation.json` and wire provider in `src/index.tsx`.
4. Add language selector and translations in `src/podcast/Settings.tsx` (minimal UI).
5. Run a full build (e.g., `vite build`) and manual smoke-check the Settings view to confirm languages switch and persist across reloads.
6. Commit in logical steps and open a focused PR.

Notes

- Keep translations minimal for Phase 1 — just enough labels to prove wiring.
- Use `i18next` detection caches to persist language to localStorage; also set `localStorage.setItem('i18nextLng', lang)` on language change as a small extra guarantee.
- If any packages cause dependency issues with the repo's lockfile, prefer conservative install flags (e.g., `--legacy-peer-deps`) to keep the change small — document any such choice in the PR description.
