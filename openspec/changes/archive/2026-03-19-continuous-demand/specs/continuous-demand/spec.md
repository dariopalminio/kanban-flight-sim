## ADDED Requirements

### Requirement: Periodic L3 demand injection
When `config.demandInterval` is greater than 0, the engine SHALL inject one new L3 workitem at the end of every tick where `currentTick % demandInterval === 0`, where `currentTick` is the tick number being produced (i.e., `state.tick + 1`). The new workitem is placed in the first status of the L3 workflow and uses the next available L3 counter value from `idCounters`.

#### Scenario: New L3 item injected at the correct tick interval
- **WHEN** `demandInterval` is 5 and the simulation has completed tick 4 (producing tick 5)
- **THEN** a new L3 workitem is added to the state at the end of tick 5

#### Scenario: No injection when tick does not divide evenly
- **WHEN** `demandInterval` is 5 and tick 3 is produced
- **THEN** no new L3 workitem is injected

#### Scenario: New item starts in first L3 workflow status
- **WHEN** a demand injection occurs
- **THEN** the new workitem's `statusId` equals `wfL3.statuses[0].id`

#### Scenario: New item ID follows the existing L3 ID scheme
- **WHEN** a demand injection occurs and the current L3 counter is N
- **THEN** the new workitem's id is `<PREFIX>-<N+1>` and `idCounters.L3` becomes `N+1`

---

### Requirement: Demand injection disabled when demandInterval is zero
When `config.demandInterval` is `0`, the engine SHALL NOT inject any new L3 workitems automatically. The simulation behaves identically to the pre-feature behavior.

#### Scenario: No injection when demandInterval is 0
- **WHEN** `demandInterval` is `0` and any tick executes
- **THEN** no new L3 workitems are added beyond those present at the start of the tick

---

### Requirement: Demand injection preserves tick() purity
The demand injection step SHALL be part of `tick(state, config) → state` with no side effects. The injected item is included in the returned `SimState.workitems` array.

#### Scenario: tick() returns new item in workitems array
- **WHEN** a demand injection tick executes
- **THEN** the returned state's `workitems` contains the new L3 item
- **THEN** the input `state.workitems` is unchanged
