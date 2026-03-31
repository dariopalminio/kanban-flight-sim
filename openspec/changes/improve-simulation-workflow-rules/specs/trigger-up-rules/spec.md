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
L0 items SHALL never trigger upward progression or auto-ready on a parent, because L0 is the lowest level. L0 items advance autonomously (Step 1).

#### Scenario: L0 advances without triggering any parent rule
- **WHEN** an L0 item advances through any status
- **THEN** no L0-to-L1 trigger-up progression or auto-ready logic is evaluated for L0 as a child

---

### Requirement: L3 is not subject to upward trigger-up rules (no grandparent)
L3 items SHALL never trigger progression or auto-ready on a parent, because L3 is the highest level and has no parent.

#### Scenario: L3 items have no parent to trigger
- **WHEN** an L3 item reaches any status
- **THEN** no upward trigger-up evaluation occurs for L3 as a child
