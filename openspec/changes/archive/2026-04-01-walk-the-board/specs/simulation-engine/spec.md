## MODIFIED Requirements

### Requirement: Autonomous advancement for L0
L0 workitems SHALL advance autonomously — they have no parent-imposed blocking conditions. They stop only at `isPosDeliveryPoint`. Columns SHALL be processed in descending order of `status.order` (right to left) so that WIP slots freed by rightmost columns are available to leftmost columns within the same tick.

#### Scenario: L0 advances without parent constraint
- **WHEN** an L0 item is eligible and the probability draw succeeds
- **THEN** the item moves to the next status in the L0 workflow

#### Scenario: L0 advancement uses right-to-left column order (Step 1)
- **WHEN** Step 1 evaluates L0 items
- **THEN** columns are processed in descending `status.order`; the updated `items` array is used for each subsequent column evaluation within Step 1
