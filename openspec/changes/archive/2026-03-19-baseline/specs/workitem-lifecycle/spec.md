## ADDED Requirements

### Requirement: Four hierarchical workitem levels
The system SHALL support four workitem levels: L3 (top), L2, L1, and L0 (bottom). Every workitem has a `level`, a `statusId`, an `id`, and an optional `parentId`. L3 items have no parent.

#### Scenario: L3 workitem has no parentId
- **WHEN** the simulation is initialized
- **THEN** all L3 workitems have `parentId === undefined`

#### Scenario: L0 workitem has a parentId pointing to its L1 parent
- **WHEN** an L0 workitem is spawned
- **THEN** its `parentId` is the `id` of the L1 item that spawned it

---

### Requirement: Initial state contains only L3 workitems
The simulation SHALL start with exactly `config.initialReleaseCount` L3 workitems, all placed in the first status of the L3 workflow. No L2, L1, or L0 items exist at initialization.

#### Scenario: Initial state has N L3 items
- **WHEN** `buildInitialState(config)` is called with `initialReleaseCount = 1`
- **THEN** the returned state has exactly 1 workitem of level L3

#### Scenario: Initial state has no children
- **WHEN** `buildInitialState(config)` is called
- **THEN** the returned state has no L0, L1, or L2 workitems

---

### Requirement: Automatic child spawning at commitment point
When a parent workitem is at the status marked `isBeforeCommitmentPoint` and has no children yet, the engine SHALL create exactly `config.childrenPerParent` children (default 3) in the first status of the child level's workflow.

#### Scenario: L1 spawns L0 children at commitment point
- **WHEN** an L1 item reaches the status with `isBeforeCommitmentPoint: true` and has no L0 children
- **THEN** exactly `childrenPerParent` L0 items are created with `parentId` set to the L1 item's id

#### Scenario: Children are not re-created if they already exist
- **WHEN** an L1 item is at the commitment status and already has L0 children
- **THEN** no additional L0 children are created

#### Scenario: New children start in the first status of their workflow
- **WHEN** L0 children are spawned
- **THEN** each child's `statusId` equals `wfL0.statuses[0].id`

---

### Requirement: Workitem ID generation scheme
Workitem IDs SHALL be generated using the first 4 characters of `workflow.workitemName` in uppercase, followed by a sequential counter, with an optional parent suffix.

- L3 format: `<PREFIX>-<n>` (e.g., `PROJ-1`)
- Child format: `<PREFIX>-<n>p<PARENT_PREFIX>-<m>` where `<PARENT_PREFIX>-<m>` is the portion of the parent's ID before the first `p` character (e.g., `EPIC-1pPROJ-1`, `STOR-2pEPIC-1`)

#### Scenario: L3 ID has no parent suffix
- **WHEN** the first L3 workitem is created with `workitemName = "Project"`
- **THEN** its ID is `PROJ-1`

#### Scenario: L2 ID encodes parent reference
- **WHEN** an L2 workitem (workitemName="Epic") is spawned as the first child of `PROJ-1`
- **THEN** its ID is `EPIC-1pPROJ-1`

#### Scenario: L1 ID encodes its direct parent only
- **WHEN** an L1 workitem (workitemName="Story") is spawned as the second child of `EPIC-1pPROJ-1`
- **THEN** its ID is `STOR-2pEPIC-1` (parent suffix uses only `EPIC-1`, not the full parent ID)

---

### Requirement: Monotonic ID counters per level
Each level (L0, L1, L2, L3) SHALL maintain an independent monotonically-increasing counter. Counters are stored in `SimState.idCounters` and are carried forward across ticks.

#### Scenario: Counter increments on each spawn
- **WHEN** two L0 items are spawned in different ticks
- **THEN** they have distinct sequential numbers (e.g., `SUBT-1...` then `SUBT-2...`)
