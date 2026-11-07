## ADDED Requirements

### Requirement: Trigger-up progression — parent advances when first child reaches second-downstream
When a parent item (L1/L2/L3) is at its first-downstream status, it SHALL automatically advance to its second-downstream status (first in-progress) as soon as at least one of its direct children is at or past the second-downstream status of the child level's workflow. Advancement is subject to WIP limit on the second-downstream target status.

#### Scenario: L3 advances from first-downstream to second-downstream when first L2 child reaches second-downstream
- **WHEN** an L3 item is at its first-downstream status AND at least one of its L2 children is at or past the second-downstream status of the L2 workflow (Step 7)
- **THEN** the L3 item advances to its second-downstream status (subject to WIP)

#### Scenario: L2 advances from first-downstream to second-downstream when first L1 child reaches second-downstream
- **WHEN** an L2 item is at its first-downstream status AND at least one of its L1 children is at or past the second-downstream status of the L1 workflow (Step 5)
- **THEN** the L2 item advances to its second-downstream status (subject to WIP)

#### Scenario: L1 advances from first-downstream to second-downstream when first L0 child reaches second-downstream
- **WHEN** an L1 item is at its first-downstream status AND at least one of its L0 children is at or past the second-downstream status of the L0 workflow (Step 3)
- **THEN** the L1 item advances to its second-downstream status (subject to WIP)

#### Scenario: Trigger-up progression does not fire if no child has reached second-downstream yet
- **WHEN** an L3 item is at its first-downstream status AND all L2 children are still at the first-downstream status of the L2 workflow (none have reached second-downstream)
- **THEN** the L3 item remains at its first-downstream status

#### Scenario: Trigger-up progression respects WIP limit
- **WHEN** a trigger-up progression would move a parent to its second-downstream status but the WIP limit of that status is already reached
- **THEN** the parent stays at its first-downstream status

---

### Requirement: Pull rule — a child starts construction only if its ancestors can
An autonomous leaf item SHALL NOT enter its second-downstream status unless each active ancestor is already at/past its own second-downstream or has capacity there. The check SHALL stop at the first ancestor already in construction and SHALL apply in Step 1, 3, 5 or 7 according to the leaf's level. A root leaf SHALL have no ancestor restriction. FIFO SHALL still prevent a blocked front item from being overtaken.

#### Scenario: Story waits while its Epic has no capacity
- **WHEN** active L2 has no second-downstream capacity and is not yet in construction
- **THEN** its autonomous descendants SHALL remain before construction: L1 in Step 3 when L1 is the leaf, or L0 in Step 1 when L0 is active

#### Scenario: Work starts when capacity frees up
- **WHEN** capacity frees in the waiting ancestor's second-downstream
- **THEN** the front leaf descendant SHALL be eligible to start and subsequent parent advancement slots SHALL evaluate the updated child positions

#### Scenario: Children of a parent already in construction are not held back
- **WHEN** a leaf's parent is already at/past second-downstream
- **THEN** ancestor pull SHALL NOT block the leaf because that parent column is full

#### Scenario: The ancestor chain is checked
- **WHEN** an L0 item's L1 parent has capacity but an unstarted active L2 or L3 ancestor has none
- **THEN** Step 1 SHALL leave L0 at first-downstream

#### Scenario: Preparation is not held back
- **WHEN** an item advances before second-downstream
- **THEN** ancestor pull SHALL NOT be evaluated

#### Scenario: L2 leaf obeys its L3 parent capacity
- **WHEN** only L3 and L2 are active and L3 has no construction capacity
- **THEN** Step 5 SHALL block its front L2 child from entering second-downstream

---

### Requirement: Trigger-up auto-ready — parent is marked ready when all children pass delivery
When a parent item (L1/L2/L3) is at its second-downstream status (first in-progress) and that status has `hasReadySignal: true`, the engine SHALL automatically set `isReady: true` on the parent as soon as ALL of its direct children are at `isPosDeliveryPoint`. This overrides the probabilistic Phase 1 of the ready-signal mechanism for this specific case. The parent SHALL NOT be able to advance past second-downstream until this condition is met.

#### Scenario: L3 is auto-marked ready when all L2 children have passed delivery
- **WHEN** an L3 item is at its second-downstream status (with `hasReadySignal: true`) AND all L2 children are at `isPosDeliveryPoint`
- **THEN** the L3 item has `isReady: true` set in the same tick

#### Scenario: L2 is auto-marked ready when all L1 children have passed delivery
- **WHEN** an L2 item is at its second-downstream status (with `hasReadySignal: true`) AND all L1 children are at `isPosDeliveryPoint`
- **THEN** the L2 item has `isReady: true` set in the same tick

#### Scenario: L1 is auto-marked ready when all L0 children have passed delivery
- **WHEN** an L1 item is at its second-downstream status (with `hasReadySignal: true`) AND all L0 children are at `isPosDeliveryPoint`
- **THEN** the L1 item has `isReady: true` set in the same tick

#### Scenario: Parent at second-downstream remains blocked while children are still in progress
- **WHEN** an L3 item is at its second-downstream status AND at least one L2 child has not yet reached `isPosDeliveryPoint`
- **THEN** the L3 item does not advance and `isReady` is NOT set

#### Scenario: Phase 2 pull still probabilistic after auto-ready
- **WHEN** a parent has `isReady: true` at its second-downstream status (set by trigger-up auto-ready)
- **THEN** the parent advances to the next status probabilistically (subject to `advanceProbability` and WIP), identical to the existing hasReadySignal Phase 2 behavior

---

### Requirement: L0 is not subject to trigger-up rules (no parent auto-progression or auto-ready)
L0 items SHALL advance autonomously in Step 1 without child-based progression or auto-ready, because they have no lower child workflow. Their positions SHALL still be used by active L1 parent rules in Steps 2-3. Ancestor pull SHALL apply at L0 second-downstream.

#### Scenario: L0 advances without triggering any parent rule
- **WHEN** Step 1 evaluates L0 advancement
- **THEN** it SHALL NOT evaluate child-based progression or auto-ready on L0 itself; Steps 2-3 SHALL retain evaluation of its active L1 parent

---

### Requirement: L3 is not subject to upward trigger-up rules (no grandparent)
L3 items SHALL never trigger progression or auto-ready on a parent, because L3 is the highest level and has no parent.

#### Scenario: L3 items have no parent to trigger
- **WHEN** an L3 item reaches any status
- **THEN** no upward trigger-up evaluation occurs for L3 as a child

---

### Requirement: Trigger-up relationships exist only between active neighboring levels
First-downstream progression and child-delivery auto-ready SHALL apply only to parents with an active immediately lower workflow, in Step 3 for L1/L0, Step 5 for L2/L1 and Step 7 for L3/L2. Their existing target WIP and readiness timing SHALL remain unchanged. The lowest active level SHALL advance autonomously without child-based triggers; the highest active level SHALL have no upward parent relationship.

#### Scenario: Two-level trigger-up retains L2 child synchronization
- **WHEN** only L2 and L1 are active and an L1 child reaches second-downstream in Step 3
- **THEN** Step 5 SHALL allow its first-downstream L2 parent to progress subject to WIP, without evaluating L3

#### Scenario: Lowest active level does not wait for missing children
- **WHEN** L1 is the leaf at second-downstream
- **THEN** Step 3 SHALL use autonomous readiness and SHALL NOT wait for L0 delivery

#### Scenario: Active parent still waits for all children
- **WHEN** L2 is at second-downstream and one active L1 child is not delivered
- **THEN** Step 5 SHALL keep L2 blocked without auto-ready, as in full models
