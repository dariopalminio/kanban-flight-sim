## ADDED Requirements

### Requirement: Tick-based discrete simulation
The simulation engine SHALL advance state in discrete steps called ticks. Each call to `tick(state, config)` produces a new `SimState` without mutating the input. The function is pure and has no side effects.

#### Scenario: Step advances tick counter
- **WHEN** `tick(state, config)` is called
- **THEN** the returned state has `tick` equal to `state.tick + 1`

#### Scenario: Pure function — input state is not mutated
- **WHEN** `tick(state, config)` is called
- **THEN** `state.workitems` remains unchanged after the call

---

### Requirement: Seven ordered steps per tick
Every tick SHALL execute exactly 8 steps in fixed order. Each step receives the item array produced by the previous step:

1. **Step 1** — Advance L0 items autonomously
2. **Step 2** — Push L1 items to first-downstream when any L0 child has entered downstream
3. **Step 3** — Advance L1 items with hierarchical rules (may spawn L0 children)
4. **Step 4** — Push L2 items to first-downstream when any L1 child has entered downstream
5. **Step 5** — Advance L2 items with hierarchical rules (may spawn L1 children)
6. **Step 6** — Push L3 items to first-downstream when any L2 child has entered downstream
7. **Step 7** — Advance L3 items with hierarchical rules (may spawn L2 children)
8. **Step 8** — Inject new L3 demand item if `demandInterval > 0` and `currentTick % demandInterval === 0`

#### Scenario: L0 advances before L1 is evaluated
- **WHEN** a tick executes
- **THEN** Step 1 completes (L0 positions updated) before Step 2 uses those positions to evaluate L1 push

#### Scenario: L2 push uses positions after L1 advancement
- **WHEN** a tick executes
- **THEN** Step 4 sees the L1 positions produced by Step 3, not the positions from the start of the tick

#### Scenario: Demand injection occurs after all advancement steps
- **WHEN** `demandInterval > 0` and the current tick qualifies for injection
- **THEN** the new L3 item is added after Steps 1–7 have completed, so it is not processed in the tick it is created

---

### Requirement: Probabilistic advancement
Each eligible workitem SHALL advance with probability `config.advanceProbability` (default 0.5) per tick. The probability is uniform across all levels and states. Eligibility is determined by hierarchical and WIP rules first; probability is applied only to eligible items.

#### Scenario: Workitem may not advance even when eligible
- **WHEN** an eligible workitem is evaluated and the random draw fails
- **THEN** the workitem remains in its current status

#### Scenario: Workitem cannot advance beyond eligible state
- **WHEN** an item is at `isPosDeliveryPoint`
- **THEN** the item does not advance regardless of the probability draw

#### Scenario: hasReadySignal — Phase 1 draw sets ready state
- **WHEN** a workitem with `isReady` unset is in a `hasReadySignal` status and the probability draw succeeds
- **THEN** `isReady` becomes `true`; `statusId` is unchanged; no WIP check is performed

#### Scenario: hasReadySignal — Phase 2 draw pulls item forward
- **WHEN** a workitem with `isReady: true` is in a `hasReadySignal` status and the probability draw succeeds and WIP allows
- **THEN** `statusId` advances to the next status and `isReady` is cleared

---

### Requirement: Maximum one transition per tick
Each workitem SHALL advance at most one status position per tick.

#### Scenario: Item cannot skip statuses
- **WHEN** a tick executes
- **THEN** a workitem in status at order N is in order N or N+1 after the tick, never N+2 or higher

---

### Requirement: Autonomous advancement for L0
L0 workitems SHALL advance autonomously — they have no parent-imposed blocking conditions. They stop only at `isPosDeliveryPoint`.

#### Scenario: L0 advances without parent constraint
- **WHEN** an L0 item is eligible and the probability draw succeeds
- **THEN** the item moves to the next status in the L0 workflow

---

### Requirement: Downstream push (Steps 2, 4, 6)
A parent item (L1/L2/L3) that is still in upstream SHALL be pushed directly to its first downstream status when any of its direct children (of the immediately lower level) enters any downstream status.

#### Scenario: L1 pushed when first L0 child enters downstream
- **WHEN** any L0 child of an L1 item transitions to a downstream status
- **THEN** the L1 item jumps to `firstDownstreamId` of the L1 workflow (respecting WIP limit)

#### Scenario: Push does not fire if parent is already at or past first-downstream
- **WHEN** an L1 item is already at or past `firstDownstreamOrder`
- **THEN** no additional push occurs in Step 2

#### Scenario: Push respects WIP limit
- **WHEN** a push would move an L1 item into a column that has reached its `wipLimit`
- **THEN** the push is blocked and the L1 item stays in its current status

---

### Requirement: Automatic child spawning at commitment point
When a parent item (L1/L2/L3) is at the status marked `isBeforeCommitmentPoint`, has no children yet, and the probabilistic draw succeeds and the WIP check for `firstDownstreamId` passes, the engine SHALL atomically:
1. Create exactly `config.childrenPerParent` children in the first status of the child level's workflow.
2. Move the parent to `firstDownstreamId`.

Children SHALL NOT be created if the parent cannot advance in that tick — either because the probability draw fails or because the WIP limit of `firstDownstreamId` is already reached. This applies symmetrically in Step 3 (L1→L0 children), Step 5 (L2→L1 children), and Step 7 (L3→L2 children).

#### Scenario: Children created only when parent successfully crosses commitment (Step 3)
- **WHEN** an L1 item is at `isBeforeCommitmentPoint`, has no L0 children, the probability draw succeeds, and `firstDownstreamId` has WIP capacity
- **THEN** exactly `childrenPerParent` L0 items are created in `wfL0.statuses[0]` AND the L1 item moves to `firstDownstreamId` in the same tick

#### Scenario: No children created when WIP blocks the crossing (Step 3)
- **WHEN** an L1 item is at `isBeforeCommitmentPoint`, has no L0 children, and `firstDownstreamId` has reached its `wipLimit`
- **THEN** no L0 children are created and the L1 item stays at `isBeforeCommitmentPoint`

#### Scenario: No children created when probability draw fails (Step 3)
- **WHEN** an L1 item is at `isBeforeCommitmentPoint`, has no L0 children, and the random draw fails
- **THEN** no L0 children are created and the L1 item remains at `isBeforeCommitmentPoint`

#### Scenario: Children not re-created on subsequent ticks (Step 3)
- **WHEN** an L1 item has already crossed commitment and has existing L0 children
- **THEN** no additional L0 children are created regardless of its current status

#### Scenario: Symmetric behavior for L2 at commitment (Step 5)
- **WHEN** an L2 item is at `isBeforeCommitmentPoint`, has no L1 children, and the crossing succeeds
- **THEN** exactly `childrenPerParent` L1 items are created AND the L2 item moves to its `firstDownstreamId`

#### Scenario: Symmetric behavior for L3 at commitment (Step 7)
- **WHEN** an L3 item is at `isBeforeCommitmentPoint`, has no L2 children, and the crossing succeeds
- **THEN** exactly `childrenPerParent` L2 items are created AND the L3 item moves to its `firstDownstreamId`

---

### Requirement: WfKeys includes second-downstream structural key
The `WfKeys` structure derived from a workflow SHALL include `secondDownstreamId` and `secondDownstreamOrder`, identifying the second status (by order) with `streamType === "DOWNSTREAM"`. This key is used to implement trigger-up progression and auto-ready without hardcoding status names.

#### Scenario: secondDownstreamId resolves to the second downstream status
- **WHEN** `getWfKeys(wf)` is called on a workflow with at least two downstream statuses
- **THEN** `secondDownstreamId` equals the `id` of the second-lowest-order status with `streamType === "DOWNSTREAM"`

#### Scenario: Workflow with only one downstream status throws at WfKeys derivation
- **WHEN** `getWfKeys(wf)` is called on a workflow that has fewer than two downstream statuses
- **THEN** an error is thrown indicating the workflow is missing a second-downstream status

---

### Requirement: Hierarchical blocking at first-downstream (Steps 3, 5, 7)
A parent item at its first downstream status SHALL advance to its second-downstream status when at least one of its direct children is at or past the second-downstream status of the child level's workflow (trigger-up progression). The advancement is subject to the WIP limit of the second-downstream target. The previous behavior (blocked until ALL children at delivery) is replaced.

#### Scenario: L1 advances from first-downstream when first L0 child reaches second-downstream (Step 3)
- **WHEN** an L1 item is at `firstDownstreamId` AND at least one L0 child is at or past `secondDownstreamOrder` of the L0 workflow
- **THEN** the L1 item advances to `secondDownstreamId` of the L1 workflow (subject to WIP)

#### Scenario: L1 remains at first-downstream when no L0 child has reached second-downstream (Step 3)
- **WHEN** an L1 item is at `firstDownstreamId` AND no L0 child has reached `secondDownstreamOrder`
- **THEN** the L1 item does not advance

#### Scenario: L2 advances from first-downstream when first L1 child reaches second-downstream (Step 5)
- **WHEN** an L2 item is at `firstDownstreamId` AND at least one L1 child is at or past `secondDownstreamOrder` of the L1 workflow
- **THEN** the L2 item advances to `secondDownstreamId` of the L2 workflow (subject to WIP)

#### Scenario: L3 advances from first-downstream when first L2 child reaches second-downstream (Step 7)
- **WHEN** an L3 item is at `firstDownstreamId` AND at least one L2 child is at or past `secondDownstreamOrder` of the L2 workflow
- **THEN** the L3 item advances to `secondDownstreamId` of the L3 workflow (subject to WIP)

#### Scenario: Trigger-up progression push respects WIP limit
- **WHEN** trigger-up progression would move a parent to second-downstream but the WIP limit is reached
- **THEN** the parent stays at first-downstream

---

### Requirement: Autonomous advancement after first-downstream
After passing the first-downstream trigger, parent items (L1/L2/L3) at second-downstream SHALL be auto-marked ready (`isReady: true`) when ALL their direct children are at `isPosDeliveryPoint` — replacing probabilistic Phase 1 for this state. Once ready, Phase 2 pull proceeds probabilistically (same `advanceProbability` as before). Parent items at second-downstream SHALL NOT advance until the auto-ready condition is met.

#### Scenario: L1 second-downstream auto-marked ready when all L0 at delivery (Step 3)
- **WHEN** an L1 item is at `secondDownstreamId` AND all L0 children are at `isPosDeliveryPoint` AND `isReady` is not yet `true`
- **THEN** the L1 item has `isReady` set to `true` in that tick; `statusId` is unchanged

#### Scenario: L1 second-downstream blocked while L0 children still in progress (Step 3)
- **WHEN** an L1 item is at `secondDownstreamId` AND one or more L0 children are not at `isPosDeliveryPoint`
- **THEN** the L1 item does not advance and `isReady` is not set

#### Scenario: L1 at second-downstream advances via Phase 2 pull once ready (Step 3)
- **WHEN** an L1 item is at `secondDownstreamId` with `isReady: true` AND the probability draw succeeds AND WIP allows
- **THEN** the L1 item advances to the next status and `isReady` is cleared

#### Scenario: L2 second-downstream auto-marked ready when all L1 at delivery (Step 5)
- **WHEN** an L2 item is at `secondDownstreamId` AND all L1 children are at `isPosDeliveryPoint`
- **THEN** the L2 item has `isReady` set to `true`; `statusId` is unchanged

#### Scenario: L3 second-downstream auto-marked ready when all L2 at delivery (Step 7)
- **WHEN** an L3 item is at `secondDownstreamId` AND all L2 children are at `isPosDeliveryPoint`
- **THEN** the L3 item has `isReady` set to `true`; `statusId` is unchanged

#### Scenario: L2 and L3 after second-downstream advance autonomously (Steps 5, 7)
- **WHEN** a parent item (L2 or L3) is past `secondDownstreamOrder` and not yet at delivery
- **THEN** it advances with `advanceProbability` per tick (same as before)

---

### Requirement: Intra-tick WIP tracking
The WIP enforcement SHALL use a mutable counter per workflow per tick step, initialized from the snapshot at the start of that step. Each approved transition increments the target column count and decrements the source column count, preventing multiple items from exceeding a WIP limit within the same step.

#### Scenario: Second item blocked when WIP limit reached mid-step
- **WHEN** one item has already been approved to move into a WIP-limited column during a step
- **THEN** a second item attempting to enter the same column in the same step is blocked even if the original snapshot count was below the limit
