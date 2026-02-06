# React 19 upgrade (WIP)

Goal: upgrade Phonograph to React 19 and modernize UI dependencies.

## Why this is non-trivial
- Current UI layer is **Material-UI v4** (`@material-ui/*`) which is not compatible with modern React.
- Target replacement: **MUI v6** (`@mui/material`, `@mui/icons-material`) + Emotion (`@emotion/react`, `@emotion/styled`).

## Planned dependency changes
- `react`, `react-dom` -> `^19`
- `zustand` -> `^5` (React 19 compatible)
- Replace:
  - `@material-ui/core`, `@material-ui/icons`, `@material-ui/lab`
  - with `@mui/material`, `@mui/icons-material`

## Code migrations needed
- Theming:
  - `createMuiTheme` -> `createTheme`
- Styling:
  - `withStyles` / `makeStyles` -> `styled()` / `sx` / theme overrides
  - `fade` -> `alpha`
- Components:
  - `ExpansionPanel*` -> `Accordion*`
  - `Hidden` -> `useMediaQuery` or `sx={{ display: { xs: 'none', md: 'block' } }}`
  - `@material-ui/lab/*` (ToggleButton, Alert, Autocomplete) -> MUI equivalents
  - Grid: update to MUI v6 Grid API or Grid2 where appropriate

## Validation gates
- `yarn test`
- `yarn bundle`
- `yarn dev`

## Current status
- Work branch: `react19-upgrade`
- This PR is a tracking/WIP PR. Next commits will implement the dependency upgrades and component migrations.
