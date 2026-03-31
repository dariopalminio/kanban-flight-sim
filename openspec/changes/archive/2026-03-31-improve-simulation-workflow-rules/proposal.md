## Why

The simulation engine uses a simplified blocking model where parents wait at the first-downstream state until ALL children are done, which does not match the SDF workflow rules documented in `docs/specs/workflows-rules.md`. The intended behavior requires parents to auto-advance when the **first** child starts working and to be marked "ready" only when all children complete — implementing the trigger-up progression and trigger-up auto-ready patterns of Flight Levels.

## What Changes

- Remove the "hierarchical blocking at first-downstream until all children done" rule from the engine.
- Add **trigger-up auto-progression**: when the first child at level N enters its first in-progress state (second downstream status), the parent at level N+1 automatically advances from its first-downstream state to its second-downstream state (first in-progress).
- Add **trigger-up auto-ready**: when all children at level N have passed the delivery-point, the parent's first in-progress state (second-downstream) is automatically marked `isReady: true`, activating the existing `hasReadySignal` pull mechanism.
- Engine tick steps are revised to include trigger-up evaluation after each level's advancement step.
- The rules apply symmetrically to L3→L2, L2→L1, and L1→L0 relationships; L0 has no children (no downward creation) and L3 has no parent (no upward progression or ready signal).

## Capabilities

### New Capabilities
- `trigger-up-rules`: Engine rules that propagate state changes upward through parent-child relationships — auto-progression (first child reaches first in-progress → parent advances from first-downstream to second-downstream) and auto-ready (all children pass delivery-point → parent's first in-progress state is marked ready).

### Modified Capabilities
- `simulation-engine`: Tick step sequence changes — remove blocking-at-first-downstream gate; add trigger-up evaluation steps (after L0, after L1, after L2 advancement).

## Impact

- `src/simulation/engine.ts` — core logic changes; blocking removed, trigger-up steps added.
- `src/domain/types.ts` — no type changes expected; existing `isReady` and `hasReadySignal` fields are reused.
- `src/config/defaultConfig.json` — SDF workflow statuses at second-downstream positions (first in-progress) need `hasReadySignal: true` to activate the two-phase pull for trigger-up auto-ready.
- No UI changes required; the existing green checkmark already visualizes the ready state.
