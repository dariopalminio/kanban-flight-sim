## MODIFIED Requirements

### Requirement: Seven ordered steps per tick
Every tick SHALL preserve the following eight ordered slots. Slots for inactive levels SHALL perform no workflow access or random draw. Each executed slot SHALL receive the item array produced by earlier slots.

1. **Step 1** - Advance active L0 autonomously.
2. **Step 2** - Push active L1 from active L0 child positions, only when both levels are active.
3. **Step 3** - Advance active L1 hierarchically with active L0, or autonomously when L1 is the leaf.
4. **Step 4** - Push active L2 from active L1 child positions, only when both levels are active.
5. **Step 5** - Advance active L2 hierarchically with active L1, or autonomously when L2 is the leaf.
6. **Step 6** - Push active L3 from active L2 child positions, only when both levels are active.
7. **Step 7** - Advance active L3 hierarchically with active L2, or autonomously when L3 is the leaf.
8. **Step 8** - Inject demand at the highest active level when the configured interval qualifies.

#### Scenario: L0 advances before L1 is evaluated
- **WHEN** L0 and L1 are active
- **THEN** Step 1 SHALL complete before Step 2 evaluates the updated L0 positions

#### Scenario: L2 push uses positions after L1 advancement
- **WHEN** L1 and L2 are active
- **THEN** Step 4 SHALL use L1 positions produced by Step 3

#### Scenario: Demand injection occurs after all advancement steps
- **WHEN** Step 8 qualifies for injection
- **THEN** the root demand item SHALL be appended after Steps 1-7 and SHALL NOT advance in its creation tick

#### Scenario: Two-level execution skips unavailable slots
- **WHEN** only L2 and L1 are active
- **THEN** Steps 1-2 and 6-7 SHALL skip processing, Step 3 SHALL advance L1 autonomously, and Steps 4-5 SHALL evaluate L2 using L1

#### Scenario: Full-model scheduling is preserved
- **WHEN** all four levels are active
- **THEN** Steps 1-8 SHALL retain their existing processing order and random-draw behavior

### Requirement: Downstream push (Steps 2, 4, 6)
A parent item with an active immediately lower workflow SHALL be pushed to its first-downstream status when any direct child enters downstream, subject to target WIP. Push SHALL NOT apply to the lowest active level and SHALL NOT inspect inactive workflows.

#### Scenario: L1 pushed when first L0 child enters downstream
- **WHEN** active L0 children of an active L1 item enter downstream
- **THEN** Step 2 SHALL push L1 to its first-downstream status subject to WIP

#### Scenario: Push does not fire if parent is already at or past first-downstream
- **WHEN** a parent is at or past first-downstream
- **THEN** its push slot SHALL NOT move it again

#### Scenario: Push respects WIP limit
- **WHEN** a parent's first-downstream status has reached its WIP limit
- **THEN** Step 2, 4 or 6 SHALL leave the parent in its current status

#### Scenario: Leaf L2 has no L1 push dependency
- **WHEN** only L3 and L2 are active
- **THEN** Step 4 SHALL NOT inspect L1, while Step 6 SHALL still evaluate L3 from active L2 children

### Requirement: Automatic child spawning at commitment point
In Steps 3, 5 and 7, a parent with an active immediately lower workflow SHALL create children only when its commitment crossing succeeds and it has no existing children. The probability/ready-signal phase, target WIP and child-entry WIP checks SHALL retain their existing behavior. At most `childrenPerParent` children SHALL be created, limited by child-entry capacity; parent crossing SHALL be blocked when no child-entry capacity is available. Children SHALL NOT be created on a failed crossing, duplicated on later ticks or created for an inactive level.

#### Scenario: Children created only when parent successfully crosses commitment (Step 3)
- **WHEN** an active L1 parent has no children and successfully crosses commitment with capacity for all requested active L0 children
- **THEN** Step 3 SHALL create `childrenPerParent` L0 children in their first status and move L1 to first-downstream

#### Scenario: No children created when WIP blocks the crossing (Step 3)
- **WHEN** first-downstream WIP prevents an L1 commitment crossing
- **THEN** Step 3 SHALL create no L0 children and SHALL leave L1 at commitment

#### Scenario: No children created when probability draw fails (Step 3)
- **WHEN** the L1 commitment-crossing probability draw fails
- **THEN** Step 3 SHALL create no children and SHALL leave the item at commitment

#### Scenario: Children not re-created on subsequent ticks (Step 3)
- **WHEN** an L1 parent already has L0 children
- **THEN** Step 3 SHALL NOT create a second child batch

#### Scenario: Symmetric behavior for L2 at commitment (Step 5)
- **WHEN** active L2 crosses commitment with active L1 and sufficient child-entry capacity
- **THEN** Step 5 SHALL create `childrenPerParent` L1 children and move L2 to first-downstream

#### Scenario: Symmetric behavior for L3 at commitment (Step 7)
- **WHEN** active L3 crosses commitment with active L2 and sufficient child-entry capacity
- **THEN** Step 7 SHALL create `childrenPerParent` L2 children and move L3 to first-downstream

#### Scenario: Child-entry capacity limits the batch
- **WHEN** a Step 3, 5 or 7 crossing succeeds but child-entry capacity is smaller than `childrenPerParent`
- **THEN** only the available number of children SHALL be created, preserving existing WIP limits

#### Scenario: Leaf never spawns absent children
- **WHEN** L1 is the lowest active level and crosses commitment in Step 3
- **THEN** it SHALL advance under autonomous rules without creating L0 items

### Requirement: Hierarchical blocking at first-downstream (Steps 3, 5, 7)
A parent with an active child workflow SHALL advance from first-downstream to second-downstream when at least one direct child is at or past its workflow's second-downstream, subject to target WIP. The lowest active level SHALL use autonomous advancement instead of waiting for nonexistent children.

#### Scenario: L1 advances from first-downstream when first L0 child reaches second-downstream (Step 3)
- **WHEN** L1 has active L0 children and one reaches second-downstream
- **THEN** Step 3 SHALL advance L1 to second-downstream subject to WIP

#### Scenario: L1 remains at first-downstream when no L0 child has reached second-downstream (Step 3)
- **WHEN** L1 has active L0 children and none has reached second-downstream
- **THEN** Step 3 SHALL leave L1 at first-downstream

#### Scenario: L2 advances from first-downstream when first L1 child reaches second-downstream (Step 5)
- **WHEN** L2 has active L1 children and one reaches second-downstream
- **THEN** Step 5 SHALL advance L2 to second-downstream subject to WIP

#### Scenario: L3 advances from first-downstream when first L2 child reaches second-downstream (Step 7)
- **WHEN** L3 has active L2 children and one reaches second-downstream
- **THEN** Step 7 SHALL advance L3 to second-downstream subject to WIP

#### Scenario: Trigger-up progression push respects WIP limit
- **WHEN** the target second-downstream WIP limit is reached
- **THEN** Step 3, 5 or 7 SHALL leave the parent at first-downstream

#### Scenario: L2 leaf does not wait for absent L1
- **WHEN** L2 is the leaf and its first-downstream item passes autonomous eligibility checks
- **THEN** Step 5 SHALL allow probabilistic advancement without L1 dependencies

### Requirement: Autonomous advancement after first-downstream
A parent with an active child workflow at second-downstream SHALL retain existing child-delivery blocking and auto-ready behavior in Step 3, 5 or 7. Once all direct children reach delivery, the parent SHALL first become ready without moving; a subsequent eligible probabilistic pull SHALL advance it and clear readiness. Beyond second-downstream it SHALL advance autonomously. The lowest active level SHALL instead use normal autonomous ready-signal rules at second-downstream.

#### Scenario: L1 second-downstream auto-marked ready when all L0 at delivery (Step 3)
- **WHEN** active L1 is at second-downstream, all active L0 children are delivered and L1 is not ready
- **THEN** Step 3 SHALL mark L1 ready without changing its status

#### Scenario: L1 second-downstream blocked while L0 children still in progress (Step 3)
- **WHEN** at least one active L0 child is not delivered
- **THEN** Step 3 SHALL NOT advance its second-downstream L1 parent or mark it ready

#### Scenario: L1 at second-downstream advances via Phase 2 pull once ready (Step 3)
- **WHEN** L1 is ready after child delivery, the draw succeeds and WIP allows
- **THEN** Step 3 SHALL advance it and clear readiness

#### Scenario: L2 second-downstream auto-marked ready when all L1 at delivery (Step 5)
- **WHEN** all active L1 children are delivered and second-downstream L2 is not ready
- **THEN** Step 5 SHALL mark L2 ready without moving it

#### Scenario: L3 second-downstream auto-marked ready when all L2 at delivery (Step 7)
- **WHEN** all active L2 children are delivered and second-downstream L3 is not ready
- **THEN** Step 7 SHALL mark L3 ready without moving it

#### Scenario: L2 and L3 after second-downstream advance autonomously (Steps 5, 7)
- **WHEN** a parent is beyond second-downstream but before delivery
- **THEN** Step 5 or 7 SHALL use its existing probabilistic advancement rules

#### Scenario: Leaf uses configured ready-signal phases
- **WHEN** L1 is the leaf and is unready at a second-downstream status with `hasReadySignal`
- **THEN** Step 3 SHALL use the normal probabilistic readiness phase without requiring L0 delivery

## ADDED Requirements

### Requirement: Autonomous advancement for the lowest active level
The lowest active level SHALL advance autonomously in its own advancement slot: Step 1 for L0, Step 3 for L1, Step 5 for L2 or Step 7 for L3. Advancement SHALL preserve right-to-left column processing, FIFO, probability, target WIP, readiness phases, delivery stopping and ancestor pull when entering second-downstream. Inactive-level items SHALL NOT be created.

#### Scenario: Single L3 workflow progresses to delivery
- **WHEN** only valid L3 is active, demand is disabled and eligible draws succeed over sufficient ticks
- **THEN** Step 7 SHALL progress the initial L3 items to delivery without spawning L2 or waiting for children

#### Scenario: Two-level SDDF simulation progresses
- **WHEN** L2 and L1 are active and eligible draws succeed
- **THEN** Step 3 SHALL progress L1 to delivery and Step 5 SHALL release L2 after its existing child-delivery readiness phase

#### Scenario: Full-model leaf behavior is unchanged
- **WHEN** all four levels are active
- **THEN** Step 1 SHALL retain existing autonomous L0 behavior

#### Scenario: Optional workflows preserve input immutability
- **WHEN** a tick executes for a partial model
- **THEN** its tick SHALL increase by one and the input state's items/counters and input configuration SHALL remain unchanged
