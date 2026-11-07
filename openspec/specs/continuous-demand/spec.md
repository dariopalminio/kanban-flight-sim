## ADDED Requirements

### Requirement: Periodic L3 demand injection
When `demandInterval > 0`, Step 8 SHALL inject one parentless workitem at the highest active level on ticks where `(state.tick + 1) % demandInterval === 0`. It SHALL use that workflow's first status and next level counter, subject to the existing first-status WIP capacity check. Injection SHALL occur after Steps 1-7; L3 SHALL remain the injection level in full models.

#### Scenario: New L3 item injected at the correct tick interval
- **WHEN** L3 is the root, `demandInterval` is 5 and tick 5 is produced with entry capacity
- **THEN** Step 8 SHALL append one L3 item

#### Scenario: No injection when tick does not divide evenly
- **WHEN** `demandInterval` is 5 and tick 3 is produced
- **THEN** Step 8 SHALL inject no item

#### Scenario: New item starts in first L3 workflow status
- **WHEN** L3 demand is injected
- **THEN** the item SHALL start at the first L3 status

#### Scenario: New item ID follows the existing L3 ID scheme
- **WHEN** L3 demand is injected with current L3 counter N
- **THEN** its ID SHALL be `<PREFIX>-<N+1>` and the L3 counter SHALL become N+1

#### Scenario: Two-level model receives L2 demand
- **WHEN** only L2 and L1 are active and an injection tick has L2 entry capacity
- **THEN** Step 8 SHALL append one L2 item with no parent, increment only the L2 counter and create no L3 item

#### Scenario: Root entry WIP prevents injection
- **WHEN** the root's first status is at its WIP limit on an injection tick
- **THEN** Step 8 SHALL append no demand item and SHALL NOT increment its counter

---

### Requirement: Demand injection disabled when demandInterval is zero
When `demandInterval` is 0, Step 8 SHALL NOT inject new workitems at any active level.

#### Scenario: No injection when demandInterval is 0
- **WHEN** `demandInterval` is 0 and a tick executes
- **THEN** Step 8 SHALL add no demand item beyond work created by Steps 1-7

---

### Requirement: Demand injection preserves tick() purity
Step 8 SHALL include injected work in the returned `SimState` without mutating input state or configuration.

#### Scenario: tick() returns new item in workitems array
- **WHEN** an injection tick executes for a full or partial model
- **THEN** the returned workitems SHALL contain the new root item and input workitems/counters SHALL remain unchanged
