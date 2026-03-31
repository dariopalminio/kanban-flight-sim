## Context

The engine currently implements a simplified blocking gate: a parent at its first-downstream status waits until ALL children are at `isPosDeliveryPoint`, then advances autonomously through the remaining downstream statuses. This model collapses two distinct Flight Levels rules into one gate and ignores the intermediate in-progress progression.

The intended model (per `docs/specs/workflows-rules.md`) has three separate trigger-up mechanics:
1. **Trigger-down** (already correct): when parent crosses commitment → children spawned at first upstream of child level.
2. **Trigger-up push** (Steps 2/4/6 — already correct): when any child enters downstream → parent pushed to first-downstream.
3. **Trigger-up progression** (NEW): when the first child reaches **second-downstream** (first in-progress) → parent advances from first-downstream to second-downstream.
4. **Trigger-up auto-ready** (NEW): when ALL children pass delivery-point → parent's second-downstream state is auto-marked `isReady: true`, enabling the existing Phase 2 pull.

The current blocking gate conflates rules 3 and 4 and ignores the distinction between "first child started working" and "all children finished".

## Goals / Non-Goals

**Goals:**
- Replace the "blocked at first-downstream until all children done" gate with proper trigger-up progression and trigger-up auto-ready logic.
- Add a `secondDownstreamId` / `secondDownstreamOrder` structural key to `WfKeys`, derived generically from the workflow (no hardcoded status names).
- Configure the SDF workflow's second-downstream statuses with `hasReadySignal: true` in `defaultConfig.json`.
- Configure the Simplified workflow's second-downstream state (In-Progress) with `hasReadySignal: true` to apply the same rules uniformly.
- Keep the `tick()` function pure and the WIP tracker unchanged.

**Non-Goals:**
- Changing Steps 1, 2, 4, 6, 8 — they remain as-is.
- Changing how children are spawned at the commitment point.
- Adding new domain types or UI components.
- Making trigger-up rules opt-in per simulation (rules apply to all simulations uniformly).

## Decisions

### Decision 1: Derive `secondDownstreamId` generically, not by hardcoded index

**Choice:** Extend `getWfKeys` to find the second status with `streamType === "DOWNSTREAM"` (sorted by order) as `secondDownstreamId`.

**Why:** The engine convention is to use structural properties from the workflow config, never hardcoded status names. This allows any simulation to work correctly as long as it has at least two downstream statuses.

**Alternative considered:** Find by index `downstreamStatuses[1]`. Same result, but "second DOWNSTREAM status" is more semantically clear.

---

### Decision 2: Handle trigger-up logic directly in Steps 3/5/7, bypassing `advanceOrSignal`

**Choice:** In the "parent at first-downstream" branch (Steps 3, 5, 7), replace the `allAtDelivery` gate with a `anyAtSecondDownstreamOrPast` check to trigger advancement. In the "parent at second-downstream" branch (the new `secondDownstreamOrder` check), auto-set `isReady = true` if all children are at delivery, and block otherwise (don't apply probabilistic phase 1).

**Why:** `advanceOrSignal` applies probabilistic phase 1 indiscriminately. Second-downstream states in a parent context require deterministic triggering from child state. Inlining the logic for these two specific cases keeps the shared helper clean and avoids adding a children-aware parameter.

**Alternative considered:** Add a `children` parameter to `advanceOrSignal`. This would make the helper harder to reason about and mixes two concerns (probabilistic signal vs. child-driven trigger).

---

### Decision 3: Mark second-downstream statuses with `hasReadySignal: true` in `defaultConfig.json`

**Choice:** For each level in both bundled simulations, the second downstream status gets `"hasReadySignal": true`. This activates Phase 2 (probabilistic pull) once `isReady` is set by the trigger-up auto-ready rule.

**Why:** Re-using the existing `hasReadySignal` / `isReady` mechanism requires no new domain fields or UI changes. The green checkmark visualization already exists and correctly represents "all children done, waiting to advance."

**Impact on Simplified simulation:** The "In-Progress" status at each level will need `hasReadySignal: true`. This changes Simplified's behavior: parents now advance from Committed to In-Progress when their first child hits In-Progress (instead of waiting until all done). This is intentional — the rules are general.

---

### Decision 4: New helper `anyAtOrPastOrder(wf, items, order)`

**Choice:** Add a generic helper that returns `true` if any item in the list is at or past a given status order. Used to evaluate "first child reached second-downstream".

**Why:** Mirrors the existing `anyInDownstream` helper but operates on a specific order threshold rather than stream type. Keeps the pattern consistent.

## Risks / Trade-offs

- **Simplified simulation behavior changes** → The parent flow in Simplified will look different after this change. Users familiar with the old behavior may be surprised. Mitigation: the change is intentional and documented; the new behavior is educationally more correct.
- **Second-downstream state requires at least 2 downstream statuses** → If a custom simulation has only 1 downstream status, `getWfKeys` would throw. Mitigation: add a guard in `getWfKeys` and document the constraint.
- **WIP at second-downstream** → Trigger-up progression uses the intra-tick WIP tracker as before, so no new WIP correctness risk.
- **Auto-ready is irreversible within a tick** → Once `isReady = true` is set in a tick, it stays set even if a re-evaluation were to show children moved back (children never move backward, so this is not a real risk).

## Migration Plan

1. Extend `getWfKeys` with `secondDownstreamId` and `secondDownstreamOrder`.
2. Add helper `anyAtOrPastOrder`.
3. Rewrite the parent-at-first-downstream branch in Steps 3, 5, 7 to use trigger-up progression.
4. Add parent-at-second-downstream branch in Steps 3, 5, 7 to handle trigger-up auto-ready (block until all children done, then auto-set isReady).
5. Update `defaultConfig.json`: add `"hasReadySignal": true` to the second-downstream status of each level in both "SDF workflows" and "Simplified" simulations.
6. No state migration needed — `isReady` is an optional field already present on `Workitem`.
