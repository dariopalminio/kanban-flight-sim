## ADDED Requirements

### Requirement: Right-to-left column processing in advancement steps
During advancement steps (Steps 1, 3-general, 5-general, 7-general), the engine SHALL process columns in descending order of `status.order` (right to left on the board). Each column's front-of-queue item is identified and advanced before moving to the next column to the left. The `items` array SHALL be updated after each column, so that a transition in column N is visible to column N-1 when it is evaluated in the same tick.

#### Scenario: Column closer to Done processed before column to its left
- **WHEN** an advancement step evaluates columns A (order 3) and B (order 2)
- **THEN** column A's front-of-queue item is evaluated and potentially advanced before column B's front-of-queue item

#### Scenario: WIP freed in column N allows column N-1 to advance in same tick
- **WHEN** column N has a WIP-limited target (column N+1) that was at capacity at tick start, AND column N's item advances to N+1 during the right-to-left loop
- **THEN** column N-1's front-of-queue item MAY advance to column N in the same tick, because the WIP tracker already reflects the freed slot

#### Scenario: Left-to-right ordering (old behavior) no longer applies
- **WHEN** an advancement step processes columns
- **THEN** the engine does NOT apply a single parallel map that uses a snapshot of fronts taken before any item has moved

---

### Requirement: Pull semantics — downstream priority
Right-to-left processing SHALL ensure that items closer to Done have priority to move before items further from Done are evaluated. This creates a pull system: movement is triggered from the demand side (Done) rather than pushed from the supply side (Backlog).

#### Scenario: Cascading advancement within a single tick
- **WHEN** column N's item advances to N+1 and column N-1 also has an eligible front-of-queue item
- **THEN** column N-1's item may advance to column N in the same tick, producing a cascade of two steps within one tick

#### Scenario: FIFO within each column is unaffected
- **WHEN** a column has multiple items
- **THEN** only the item with the lowest `enteredAt` (tie-broken by array position) is eligible for advancement, regardless of column processing order
