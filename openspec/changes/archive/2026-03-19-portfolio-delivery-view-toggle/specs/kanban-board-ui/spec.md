## MODIFIED Requirements

### Requirement: Four vertically-stacked boards
The UI SHALL render up to four Kanban boards stacked vertically in hierarchical order: L3 at top, L2, L1, L0 at bottom. Which boards are visible at any time SHALL be determined by the active view mode. All visible boards SHALL be rendered without horizontal scrolling.

#### Scenario: Boards rendered in L3→L0 order when all are visible
- **WHEN** the application renders boards from the visible set
- **THEN** boards appear top-to-bottom in descending level order (higher level number = higher position)

#### Scenario: Only L3 and L2 rendered in Portafolio mode
- **WHEN** the active view mode is "Portafolio"
- **THEN** exactly two boards are rendered: L3 at top, L2 below it

#### Scenario: Only L2, L1, L0 rendered in Delivery mode
- **WHEN** the active view mode is "Delivery"
- **THEN** exactly three boards are rendered: L2 at top, L1 in the middle, L0 at the bottom
