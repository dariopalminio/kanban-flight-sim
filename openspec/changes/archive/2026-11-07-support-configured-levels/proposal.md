## Why

Models containing fewer than four workflows currently fail during loading because missing workflows are dereferenced unconditionally. The existing SDDF model defines only L2 and L1; it must be usable as a two-level simulation without inventing L3 or L0 workflows.

## What Changes

- Accept any non-empty consecutive subset of L3, L2, L1, L0, including a single level. Reject gaps such as L3 + L1 with a descriptive configuration error.
- Create initial work and periodic demand at the highest active level; let the lowest active level advance autonomously.
- Apply spawning, synchronization, delivery blocking and ancestor pull only across active parent-child relationships, preserving existing full-model FIFO, WIP and ready-signal behavior.
- Render only available boards, filter unavailable view options and keep model switching, reset, autoplay and editable WIP limits working with partial configurations.
- Retain the Without L0 feature when L0 and another level are configured; prevent it from disabling a sole L0 workflow.
- Preserve existing JSON parameter names, IDs and color rules; assign parentless roots at any level colors from the existing palette.

## Capabilities

### New Capabilities

None. This extends existing configuration, engine and interface capabilities.

### Modified Capabilities

- `simulation-configuration`: Optional consecutive workflows and root-level parameter semantics.
- `per-model-config-files`: Partial workflow maps and descriptive invalid-hierarchy errors.
- `simulation-engine`: Availability-aware Steps 1-7, autonomous lowest level and preserved parent rules.
- `workitem-lifecycle`: Root initialization, child creation boundaries and root IDs.
- `continuous-demand`: Step 8 demand injection into the highest active workflow.
- `trigger-up-rules`: Pull and synchronization boundaries follow the active hierarchy.
- `workitem-color`: Palette assignment for parentless roots below L3.
- `board-view-mode`: Available-board intersections, filtered views and safe view fallback.
- `simulation-selector-component`: Availability-aware view options.
- `without-l0-mode`: Safe interaction between optional L0 and the existing toggle.

## Impact

- Configuration and domain types: `src/config/defaultConfig.ts`, `src/domain/types.ts`; shared ordered-level derivation and validation reused by the engine and UI.
- Simulation: `src/simulation/engine.ts`, including initialization, Steps 1-7 and final demand injection (Step 8).
- UI: `src/App.tsx` and `src/components/SimulationSelector.tsx`; board rendering and WIP overrides must stop dereferencing absent workflows.
- Documentation: `README.md` configuration guidance and relevant simulation-model documentation.
- Existing four-level JSON files need no migration. The current two-level SDDF file stays intact; no filler workflows, backend, dependency upgrades or new styling system are introduced.
