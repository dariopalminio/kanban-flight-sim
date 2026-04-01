## ADDED Requirements

### Requirement: FIFO card display order within columns
Cards within a column SHALL be rendered in ascending order of `enteredAt` — the workitem that entered the column earliest SHALL appear at the top of the column; the most recently arrived SHALL appear at the bottom. This order is applied at render time and does not affect the underlying workitems array order in state.

#### Scenario: Cards sorted oldest-first within a column
- **WHEN** a column contains workitems with enteredAt values [7, 3, 5]
- **THEN** the cards render top-to-bottom in the order: enteredAt=3, enteredAt=5, enteredAt=7

#### Scenario: New items appear at the bottom of the column
- **WHEN** a workitem enters a column in tick N (enteredAt=N) and other items in that column have enteredAt < N
- **THEN** the new workitem's card appears below all existing cards in that column

#### Scenario: Items with equal enteredAt maintain stable relative order
- **WHEN** two workitems in the same column have identical `enteredAt` values
- **THEN** their relative display order is consistent across re-renders (stable sort)
