## Why

This change captures the existing implemented system as a formal OpenSpec baseline — a reverse-engineering exercise to document the current behavior, business rules, and architecture so that future changes can be tracked as deltas against a known, specified state.

## What Changes

- No code changes. This is a documentation-only baseline.
- Creates OpenSpec artifacts that describe the system as it exists today.
- Establishes the canonical spec files for all major capabilities.

## Capabilities

### New Capabilities

- `simulation-engine`: The core tick-based simulation engine — hierarchical 7-step execution, probabilistic advancement, WIP tracking, and child spawning rules.
- `workitem-lifecycle`: Workitem creation, ID generation scheme, parent-child hierarchy, and state transitions across L0–L3 levels.
- `simulation-configuration`: JSON-driven multi-simulation configuration including workflows, status properties, and simulation parameters.
- `kanban-board-ui`: The four-board visual display — Board, Column, Card components and their rendering logic.
- `simulation-controls`: Step/Autoplay/Reset controls, simulation selector dropdown, and mutually-exclusive view-highlight toggles.

### Modified Capabilities

*(none — this is a greenfield baseline)*

## Impact

- Affected code: all of `src/` (read-only documentation pass)
- No code, API, or dependency changes
- Lays groundwork for future changes to reference against stable specs
