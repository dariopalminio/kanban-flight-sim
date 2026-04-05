## Why

The simulator currently always runs with four levels (L3→L2→L1→L0). Some educational scenarios benefit from a three-level model where L1 is the operational level and has no children. Adding a "Without L0" toggle lets users explore flow dynamics at the L1 level without the complexity of a subordinate L0 workflow.

## What Changes

- Add `withoutL0?: boolean` to the `Config` type in `domain/types.ts`
- Modify `tick()` in `simulation/engine.ts` to skip L0-related steps when `config.withoutL0` is true: L1 advances autonomously through all statuses (no L0 children spawned, no L0 blocking rules applied)
- Add a toggle button to `SimulationSelector` that controls `withoutL0` state in `App.tsx`
- When the toggle changes, the simulation resets (orphaned L0 items cannot be meaningfully continued)

## Capabilities

### New Capabilities

- `without-l0-mode`: Engine and UI support for running the simulation without L0, where L1 advances as the operational level

### Modified Capabilities

- `simulation-engine`: `tick()` conditionally skips Steps 1–2 and adapts Step 3 based on `config.withoutL0`
- `simulation-selector-component`: New toggle prop and UI control in `SimulationSelector`
- `simulation-configuration`: `Config` type gains optional `withoutL0` field

## Impact

- `src/domain/types.ts`: `Config` gains `withoutL0?: boolean`
- `src/simulation/engine.ts`: Steps 1, 2, and relevant parts of Step 3 guarded by `withoutL0`
- `src/components/SimulationSelector.tsx`: New toggle button + two new props
- `src/App.tsx`: New `withoutL0` state, passed as part of a derived config object, resets sim on toggle
- No changes to `defaultConfig.json`, `Board.tsx`, `Column.tsx`, or `Card.tsx`
