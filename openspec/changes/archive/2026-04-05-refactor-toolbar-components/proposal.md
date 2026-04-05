## Why

`App.tsx` has grown into a monolithic file that mixes simulation orchestration with toolbar UI rendering, making it difficult to read, navigate, and extend. Extracting the toolbar controls into focused components reduces cognitive load and aligns with the project's existing `src/components/` structure.

## What Changes

- Extract the simulation selector dropdown and board view mode dropdown into a new `SimulationSelector` component
- Extract the simulation playback controls (Step, Reset, Slower, Faster, Autoplay, Tick info) into a new `SimulationControls` component
- Extract the four mutually-exclusive Kanban signal view toggles into a new `KanbanSignalSelector` component
- `App.tsx` becomes a lean orchestrator that composes these components and passes props

## Capabilities

### New Capabilities

- `simulation-selector-component`: Dropdown to select simulation by name and board view mode (Portafolio / Delivery / Full), extracted into `src/components/SimulationSelector.tsx`
- `simulation-controls-component`: Playback controls (Step, Reset, Slower, Faster, Autoplay toggle, Tick counter, Tick ms display), extracted into `src/components/SimulationControls.tsx`
- `kanban-signal-selector-component`: Mutually-exclusive view toggle buttons (Upstream/Downstream, Status Category, Before Commitment Point, Pos Delivery Point), extracted into `src/components/KanbanSignalSelector.tsx`

### Modified Capabilities

## Impact

- `src/App.tsx`: Significant reduction in JSX and handler code; props passed down to new components
- `src/components/SimulationSelector.tsx`: New file
- `src/components/SimulationControls.tsx`: New file
- `src/components/KanbanSignalSelector.tsx`: New file
- No changes to simulation engine, domain types, or config
- No behavioral changes — pure structural refactor
