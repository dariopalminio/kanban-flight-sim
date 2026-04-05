## ADDED Requirements

### Requirement: Done columns scroll when card count exceeds threshold
When a column's `statusCategory` is `DONE` and it contains more than `DONE_COLUMN_SCROLL_THRESHOLD` cards, the card area of the column SHALL be constrained to a maximum height and SHALL display a vertical scrollbar as needed (`overflowY: "auto"`). Columns with `statusCategory` other than `DONE` SHALL NOT be affected by this constraint. The column header (status name and WIP indicator) SHALL remain permanently visible and SHALL NOT scroll.

The constant `DONE_COLUMN_SCROLL_THRESHOLD` SHALL be defined at the top of `Column.tsx` and its default value SHALL be `4`.

#### Scenario: Done column with more than threshold cards shows scroll
- **WHEN** a column has `statusCategory === "DONE"` and contains more than `DONE_COLUMN_SCROLL_THRESHOLD` cards
- **THEN** the card area SHALL have `overflowY: "auto"` and a `maxHeight` that limits visible cards to `DONE_COLUMN_SCROLL_THRESHOLD`

#### Scenario: Done column at or below threshold shows no scroll constraint
- **WHEN** a column has `statusCategory === "DONE"` and contains `DONE_COLUMN_SCROLL_THRESHOLD` or fewer cards
- **THEN** the card area SHALL NOT have any `maxHeight` restriction applied

#### Scenario: Non-Done columns are never scroll-constrained
- **WHEN** a column has `statusCategory` of `TODO` or `IN_PROGRESS` regardless of card count
- **THEN** the card area SHALL NOT have any `maxHeight` restriction applied

#### Scenario: Column header stays visible while cards scroll
- **WHEN** a Done column has more than `DONE_COLUMN_SCROLL_THRESHOLD` cards and the user scrolls the card area
- **THEN** the column header (status name, WIP indicator) SHALL remain visible at the top of the column
