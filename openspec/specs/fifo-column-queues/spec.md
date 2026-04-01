## ADDED Requirements

### Requirement: Workitem arrival timestamp
Each `Workitem` SHALL carry an `enteredAt: number` field recording the tick at which it most recently entered its current status. The field SHALL be initialized to `0` for all items produced by `buildInitialState`. On every `statusId` transition (any step, any level), `enteredAt` SHALL be updated to the tick number of the transition.

#### Scenario: enteredAt initialized to 0 on build
- **WHEN** `buildInitialState(config)` is called
- **THEN** every workitem in the returned state has `enteredAt === 0`

#### Scenario: enteredAt updated on status transition
- **WHEN** a workitem transitions from one statusId to another during a tick
- **THEN** the workitem's `enteredAt` is set to the current tick number

#### Scenario: enteredAt unchanged when workitem does not transition
- **WHEN** a workitem remains in the same statusId after a tick
- **THEN** the workitem's `enteredAt` value is not modified

---

### Requirement: FIFO advancement policy per column
Steps 1, 3, 5, and 7 (advancement steps) SHALL enforce strict FIFO ordering within each column. Among items in the same column (same `statusId`), only the item with the lowest `enteredAt` value is eligible to advance. Push steps (2, 4, 6) are exempt from this rule. In the case of a tie in `enteredAt`, the item at the lower array index takes priority.

#### Scenario: Only the front-of-queue item is eligible in an advancement step
- **WHEN** two or more items share the same statusId and the step is an advancement step (1, 3, 5, or 7)
- **THEN** only the item with the lowest `enteredAt` is considered eligible; all others are ineligible regardless of other conditions

#### Scenario: Tie-break by array position
- **WHEN** two items share the same statusId and the same `enteredAt` value
- **THEN** the item at the lower array index is treated as the front of the queue

#### Scenario: Non-front-of-queue items are ineligible
- **WHEN** an item is not the front-of-queue item in its column during an advancement step
- **THEN** the item does not advance even if it would otherwise satisfy hierarchical and WIP rules

#### Scenario: Push steps are exempt from FIFO eligibility
- **WHEN** a push step (2, 4, or 6) evaluates whether to push a parent item forward
- **THEN** FIFO-queue eligibility is not checked; only downstream child presence and WIP rules apply

---

### Requirement: Column evaluation order within advancement steps
In advancement steps (Steps 1, 3-general, 5-general, 7-general), columns SHALL be evaluated in descending order of `status.order` (highest order first). The FIFO rule per column (lowest `enteredAt` item is front-of-queue) SHALL continue to apply unchanged within each individual column.

#### Scenario: Columns sorted descending before front-of-queue selection
- **WHEN** an advancement step begins
- **THEN** the set of active columns is sorted by `status.order` descending before any front-of-queue item is identified or advanced

#### Scenario: FIFO within a column is independent of column processing order
- **WHEN** a column is evaluated during its turn in the right-to-left loop
- **THEN** the front-of-queue item is still the one with the lowest `enteredAt` (tie-broken by array position), exactly as before
