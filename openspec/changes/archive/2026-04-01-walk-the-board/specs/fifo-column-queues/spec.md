## ADDED Requirements

### Requirement: Column evaluation order within advancement steps
In advancement steps (Steps 1, 3-general, 5-general, 7-general), columns SHALL be evaluated in descending order of `status.order` (highest order first). The FIFO rule per column (lowest `enteredAt` item is front-of-queue) SHALL continue to apply unchanged within each individual column.

#### Scenario: Columns sorted descending before front-of-queue selection
- **WHEN** an advancement step begins
- **THEN** the set of active columns is sorted by `status.order` descending before any front-of-queue item is identified or advanced

#### Scenario: FIFO within a column is independent of column processing order
- **WHEN** a column is evaluated during its turn in the right-to-left loop
- **THEN** the front-of-queue item is still the one with the lowest `enteredAt` (tie-broken by array position), exactly as before
