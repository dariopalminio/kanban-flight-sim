## Why

Currently, WIP limits are defined only in `defaultConfig.json` and cannot be changed at runtime without editing the source file. Users need to experiment with different WIP limits interactively during simulation to explore how they affect flow.

## What Changes

- Column headers that have a `wipLimit` will replace the static limit display with an editable number input, allowing the user to change the WIP limit in real time.
- WIP limit overrides are stored in React state (no persistence needed), so they reset when the simulation resets.
- The simulation engine continues to read `wipLimit` from the workflow status; the UI layer will inject the user-edited value before passing config to the engine.

## Capabilities

### New Capabilities

- `editable-wip-limit`: Inline editable number input in column headers that allows changing a column's WIP limit at runtime without modifying configuration files.

### Modified Capabilities

- `kanban-board-ui`: The column header WIP display changes from a static read-only label to an interactive inline input element.

## Impact

- `src/components/Column.tsx` — replaces static WIP limit text with an editable `<input type="number">`.
- `src/App.tsx` — holds a `wipLimitOverrides` state map `{ [statusId]: number }` and passes it down to boards/columns; merges overrides into the config before each tick.
- `src/config/defaultConfig.ts` / `src/domain/types.ts` — no changes needed; the engine continues to use the existing `wipLimit` field on `Status`.
- No new dependencies.
