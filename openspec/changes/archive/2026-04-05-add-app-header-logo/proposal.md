## Why

The app currently has no visible identity — there is no logo or title displayed in the UI. Adding a branded header with the app logo and name gives users a clear visual anchor and makes the simulator feel like a complete, polished product.

## What Changes

- Add a header section to the app UI that displays the `logo-kanban-flight-sim.svg` icon followed by the title "Kanba-Flight-Sim"
- The header appears at the top of the app, above the simulation controls and boards

## Capabilities

### New Capabilities

- `app-header`: A persistent top-of-page header component displaying the app logo (`src/assets/logo-kanban-flight-sim.svg`) and the app title "Kanba-Flight-Sim"

### Modified Capabilities

<!-- No existing specs require requirement-level changes for this change -->

## Impact

- `src/App.tsx`: Add header markup (logo `<img>` + `<h1>` title) at the top of the rendered output
- `src/assets/logo-kanban-flight-sim.svg`: Existing asset used as-is
- No engine, config, or domain changes required
