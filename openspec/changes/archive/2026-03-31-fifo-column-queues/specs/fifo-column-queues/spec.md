## ADDED Requirements

### Requirement: Workitem arrival timestamp
Every `Workitem` SHALL carry an `enteredAt: number` field recording the tick number at which it entered its current `statusId`. The field SHALL be set to `0` for items created by `buildInitialState`. The field SHALL be updated to the current tick number whenever the item's `statusId` changes inside `tick()`.

#### Scenario: Initial items have enteredAt 0
- **WHEN** `buildInitialState(config)` is called
- **THEN** every workitem in the returned state has `enteredAt === 0`

#### Scenario: enteredAt is updated on status transition
- **WHEN** a workitem transitions from status A to status B during tick N
- **THEN** the workitem's `enteredAt` equals `N` after the tick completes

#### Scenario: enteredAt is unchanged when item does not advance
- **WHEN** a workitem does not change its `statusId` during a tick
- **THEN** the workitem's `enteredAt` retains its previous value

---

### Requirement: FIFO advancement policy per column
Within each column (group of workitems sharing the same `statusId`), the simulation engine SHALL apply a strict FIFO advancement policy: only the workitem with the lowest `enteredAt` value (the "front of queue") in that column is eligible to attempt advancement in a given tick. All other workitems in the same column SHALL remain unchanged in that tick, regardless of the probability draw.

If two workitems in the same column share the same `enteredAt` value, the one that appears first in the workitems array SHALL be treated as the front of the queue.

This policy applies to all advancement steps (Steps 1, 3, 5, 7). Push steps (Steps 2, 4, 6) are exempt because they perform unconditional structural transitions, not probabilistic selection.

#### Scenario: Only the front-of-queue item advances
- **WHEN** two workitems A (enteredAt=3) and B (enteredAt=7) are in the same column
- **THEN** only item A is eligible to advance; B stays regardless of the probability draw

#### Scenario: After front-of-queue item advances, next item becomes eligible
- **WHEN** item A (enteredAt=3) advances out of the column in tick N
- **THEN** item B (enteredAt=7) becomes the new front-of-queue and is eligible in tick N+1

#### Scenario: Tie-break uses array position
- **WHEN** two workitems have identical `enteredAt` values in the same column
- **THEN** the one appearing first in the workitems array is treated as the front

#### Scenario: Push steps bypass FIFO (Steps 2, 4, 6)
- **WHEN** a push step (Step 2, 4, or 6) evaluates a parent item that qualifies for a push transition
- **THEN** the push is applied regardless of whether the item is at the front of its column queue
