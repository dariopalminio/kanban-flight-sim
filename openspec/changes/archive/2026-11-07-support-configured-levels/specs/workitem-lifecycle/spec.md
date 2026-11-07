## MODIFIED Requirements

### Requirement: Four hierarchical workitem levels
The system SHALL support level identifiers L3, L2, L1 and L0 while simulating only the configured active consecutive subset. Every workitem SHALL have `level`, `statusId`, `id` and an optional `parentId`. Items at the highest active level SHALL have no parent; spawned lower-level items SHALL reference their active immediately higher parent.

#### Scenario: L3 workitem has no parentId
- **WHEN** L3 is active and the simulation initializes
- **THEN** all initial L3 items SHALL have no `parentId`

#### Scenario: L0 workitem has a parentId pointing to its L1 parent
- **WHEN** Step 3 spawns L0 from active L1
- **THEN** its `parentId` SHALL reference the spawning L1 item

#### Scenario: L2 is the root of the two-level model
- **WHEN** only L2 and L1 are active
- **THEN** root L2 items SHALL have no parent and Step 5 SHALL create L1 children referencing those roots

### Requirement: Initial state contains only L3 workitems
Initialization SHALL create exactly `initialReleaseCount` workitems at the highest active level, in that workflow's first status at tick 0 with no parent. Only that level's counter SHALL be initialized to `initialReleaseCount`; all other counters SHALL start at zero. L3 SHALL remain the root when configured and active.

#### Scenario: Initial state has N L3 items
- **WHEN** all four levels are active and `initialReleaseCount` is 1
- **THEN** initialization SHALL create exactly one L3 item

#### Scenario: Initial state has no children
- **WHEN** initialization executes
- **THEN** every initial item SHALL be parentless and no lower-level child SHALL exist

#### Scenario: Initialization uses the highest configured middle level
- **WHEN** only L2 and L1 are active and `initialReleaseCount` is 2
- **THEN** initialization SHALL create two L2 items in L2's first status, set the L2 counter to 2 and leave other counters at 0

#### Scenario: Single L0 initialization is valid
- **WHEN** only L0 is active
- **THEN** initialization SHALL create the requested parentless L0 items without accessing L1-L3

### Requirement: Automatic child spawning at commitment point
In Steps 3, 5 and 7, successful commitment crossings SHALL create children only when the immediately lower level is active and the parent has no children. Spawn count, probability, readiness and WIP conditions SHALL follow `simulation-engine`. The leaf SHALL NOT spawn children.

#### Scenario: L1 spawns L0 children at commitment point
- **WHEN** active L1 successfully crosses commitment in Step 3 with no children and capacity for the requested active L0 batch
- **THEN** it SHALL create `childrenPerParent` L0 items referencing L1

#### Scenario: Children are not re-created if they already exist
- **WHEN** a parent with existing children is evaluated in Step 3, 5 or 7
- **THEN** no duplicate child batch SHALL be created

#### Scenario: New children start in the first status of their workflow
- **WHEN** Step 3 creates L0 children
- **THEN** each child's `statusId` SHALL equal the active L0 workflow's first status

#### Scenario: Lowest active L1 never creates L0
- **WHEN** L1 is the leaf and crosses commitment in Step 3
- **THEN** no L0 item SHALL be created

### Requirement: Workitem ID generation scheme
IDs SHALL use the first four characters of `workflow.workitemName` in uppercase and that level's sequential counter. Root IDs at any active level SHALL be `<PREFIX>-<n>` without a parent suffix. Spawned child IDs SHALL be `<PREFIX>-<n>p<PARENT_BASE>`, where `PARENT_BASE` is the parent ID before its first `p`.

#### Scenario: L3 ID has no parent suffix
- **WHEN** the first root L3 item uses `workitemName = "Project"`
- **THEN** its ID SHALL be `PROJ-1`

#### Scenario: L2 ID encodes parent reference
- **WHEN** Step 7 spawns the first L2 Epic from `PROJ-1`
- **THEN** its ID SHALL be `EPIC-1pPROJ-1`

#### Scenario: L1 ID encodes its direct parent only
- **WHEN** Step 5 spawns Story number 2 from `EPIC-1pPROJ-1`
- **THEN** its ID SHALL be `STOR-2pEPIC-1`

#### Scenario: L2 root and child IDs use their own roles
- **WHEN** only L2 and L1 are active, the first Epic root is initialized and its first Story child is spawned in Step 5
- **THEN** their IDs SHALL be `EPIC-1` and `STOR-1pEPIC-1` respectively
