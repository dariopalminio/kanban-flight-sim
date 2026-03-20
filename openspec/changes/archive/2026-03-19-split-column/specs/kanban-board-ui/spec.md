## MODIFIED Requirements

### Requirement: Columns per workflow status
Each board SHALL render one visual column per distinct column unit in its workflow, in `order` sequence (left to right). A pair of consecutive statuses sharing the same `splitGroup` counts as ONE visual column (a split column). Columns use CSS flex-wrap so that narrow viewports wrap columns without horizontal scrolling.

#### Scenario: Column count matches workflow status count for non-split simulation
- **WHEN** the "Simplified" simulation is active (no split statuses)
- **THEN** each board renders exactly 4 columns, identical to before

#### Scenario: Split status pair counts as one visual column
- **WHEN** a workflow has 5 statuses where two share a `splitGroup`
- **THEN** the board renders 4 visual columns: 3 simple columns + 1 split column
