## MODIFIED Requirements

### Requirement: Cards display workitem ID with level color
Each card SHALL display the workitem's `id` string centered on a colored background. The background color SHALL be `item.color` (the workitem's lineage color), not a fixed level-based color. The `LEVEL_COLORS` map in `Card.tsx` SHALL be removed.

#### Scenario: L3 card uses item.color as background
- **WHEN** an L3 workitem with `color: "#3498db"` is rendered
- **THEN** the card background is `#3498db`

#### Scenario: L0 child card uses same color as its L3 ancestor
- **WHEN** an L0 workitem inherits color `#2ecc71` from its ancestor chain
- **THEN** the card background is `#2ecc71`, not the previous fixed L0 color `#ea580c`

#### Scenario: Two sibling items share the same card color
- **WHEN** two L1 items share the same L3 ancestor
- **THEN** both cards display the same background color
