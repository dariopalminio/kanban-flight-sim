## ADDED Requirements

### Requirement: WfKeys includes second-downstream structural key
The `WfKeys` structure derived from a workflow SHALL include `secondDownstreamId` and `secondDownstreamOrder`, identifying the second status (by order) with `streamType === "DOWNSTREAM"`. This key is used to implement trigger-up progression and auto-ready without hardcoding status names.

#### Scenario: secondDownstreamId resolves to the second downstream status
- **WHEN** `getWfKeys(wf)` is called on a workflow with at least two downstream statuses
- **THEN** `secondDownstreamId` equals the `id` of the second-lowest-order status with `streamType === "DOWNSTREAM"`

#### Scenario: Workflow with only one downstream status throws at WfKeys derivation
- **WHEN** `getWfKeys(wf)` is called on a workflow that has fewer than two downstream statuses
- **THEN** an error is thrown indicating the workflow is missing a second-downstream status

---

## MODIFIED Requirements

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
