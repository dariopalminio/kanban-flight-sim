## Why

The toolbar buttons in `SimulationControls` currently rely entirely on text labels, which makes the controls harder to scan at a glance. Adding recognizable icons alongside labels improves visual clarity and gives the toolbar a more polished appearance.

## What Changes

- Install `lucide-react` as a new production dependency
- Add icons next to each button label in `SimulationControls`: Step, Autoplay/Pause, Reset, Slower, Faster

## Capabilities

### New Capabilities

### Modified Capabilities

- `simulation-controls-component`: Buttons now render a lucide-react icon alongside their text label

## Impact

- `package.json` / `package-lock.json`: new dependency `lucide-react`
- `src/components/SimulationControls.tsx`: import and render icons inside each button
- No changes to App.tsx, engine, domain types, or config
