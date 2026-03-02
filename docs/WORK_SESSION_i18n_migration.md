# Phonograph Podcast App - Internationalization Migration

**Date**: February 28 - March 1, 2026  
**Branch**: `international`  
**Status**: Complete  
**Tags**: react-intl, i18n, localization, translations, typescript

---

## Summary

Complete internationalization (i18n) migration of the Phonograph podcast app using `react-intl`. Converted all 12 UI components with hardcoded strings to use FormatJS/react-intl, extracted 77 messages, and created translations for 4 locales (English, Spanish, French, Chinese).

---

## Phase 1: Initial Setup

### Dependencies Added
- `react-intl` - React bindings for FormatJS internationalization
- `@formatjs/cli` - Message extraction tooling

### Core i18n Infrastructure
Created `src/i18n/` directory with:

| File | Purpose |
|------|---------|
| `locale.ts` | `getRuntimeLocale()` and `normalizeLocale()` helpers for browser locale detection |
| `relativeTime.ts` | Utility to replace Day.js relative time with `intl.formatRelativeTime` |
| `translations/index.ts` | `getMessages()` helper for locale-based message loading |
| `translations/en.json` | English base messages (77 strings) |
| `translations/es.json` | Spanish translations |
| `translations/fr.json` | French translations |
| `translations/zh.json` | Chinese (Simplified) translations |

### App Entry Point
Modified `src/index.tsx`:
- Wrapped app with `<IntlProvider>` from react-intl
- Configured locale detection from `navigator.language`
- Connected translation loading via `getMessages()` helper

---

## Phase 2: Component Internationalization

### Components Converted (12 total)

#### Core Components
| Component | Changes |
|-----------|---------|
| `src/core/Footer.tsx` | Navigation labels |
| `src/core/Header.tsx` | Title, aria-labels |
| `src/core/Playlist.tsx` | Title, buttons, empty state message |
| `src/core/SpeedControl.tsx` | Aria-labels (also fixed optional onClick prop type) |
| `src/core/SleepTimer.tsx` | Aria-labels |

#### Podcast Components
| Component | Changes |
|-----------|---------|
| `src/podcast/Settings.tsx` | All settings strings with ICU interpolation |
| `src/podcast/Library.tsx` | Title, empty state, aria-labels |
| `src/podcast/Discovery/index.tsx` | Title, error messages, section labels |
| `src/podcast/Discovery/Search.tsx` | Search label, aria-labels |
| `src/podcast/PodcastView/PodcastHeader.tsx` | Tooltips, snackbar messages, buttons |
| `src/podcast/PodcastView/EpisodeList.tsx` | Drawer labels, snackbar messages, chips, relative time |

---

## Phase 3: Message Extraction & Translation

### Extraction
Used `@formatjs/cli` to extract all 77 messages to `en.json` base file.

### Message ID Naming Convention
```
nav.*        - Navigation labels
settings.*   - Settings page strings
library.*    - Library section strings
playlist.*   - Playlist section strings
discover.*   - Discovery/search strings
podcast.*    - Podcast detail strings
episode.*    - Episode-related strings
common.*     - Shared/reusable strings
a11y.*       - Accessibility labels (aria-labels, screen reader text)
```

### ICU Message Format Examples
```json
"a11y.minutesValue": "{count} minutes"
"episode.progress": "Progress: {percent}%"
"episode.season": "Season {season}"
```

---

## Key Technical Decisions

1. **Inline defaultMessage approach** - Messages defined in components with `defaultMessage` prop, not external ID-only references. Allows extraction while keeping code readable.

2. **Static translation loading** - Translations bundled with app at build time rather than dynamically fetched. Simpler architecture, acceptable bundle size for 4 locales.

3. **Browser locale detection** - Uses `navigator.language` with automatic fallback to English for unsupported locales.

4. **Day.js replacement** - Replaced Day.js `fromNow()` relative time with `intl.formatRelativeTime()` for fully localized output.

---

## Verification Results

- TypeScript typecheck: **PASS**
- All 23 tests: **PASS**  
- Production build: **SUCCESS**

---

## File Inventory

### Files Created (7)
```
src/i18n/locale.ts
src/i18n/relativeTime.ts
src/i18n/translations/index.ts
src/i18n/translations/en.json
src/i18n/translations/es.json
src/i18n/translations/fr.json
src/i18n/translations/zh.json
```

### Files Modified (13)
```
package.json (dependencies)
src/index.tsx (IntlProvider wrapper)
src/core/Footer.tsx
src/core/Header.tsx
src/core/Playlist.tsx
src/core/SpeedControl.tsx
src/core/SleepTimer.tsx
src/podcast/Settings.tsx
src/podcast/Library.tsx
src/podcast/Discovery/index.tsx
src/podcast/Discovery/Search.tsx
src/podcast/PodcastView/PodcastHeader.tsx
src/podcast/PodcastView/EpisodeList.tsx
```

---

## Future Considerations

- Add more locales as needed (German, Japanese, etc.)
- Consider lazy-loading translations for larger locale sets
- Add locale switcher UI component
- Set up translation management workflow (Crowdin, Lokalise, etc.)
