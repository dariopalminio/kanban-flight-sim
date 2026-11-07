## MODIFIED Requirements

### Requirement: View mode selector
The UI SHALL offer only existing view modes whose target set intersects the active hierarchy. Candidate modes SHALL retain their order: Portafolio, Delivery, Full, L3, L2, L1. The initial selection SHALL be Full, preserving the current application behavior. Only one option SHALL be selected.

#### Scenario: Default selection on load
- **WHEN** the application first renders a valid full or partial model
- **THEN** Full SHALL be selected

#### Scenario: User switches to L3 mode
- **WHEN** active L3 exists and the user selects L3
- **THEN** L3 SHALL be selected exclusively

#### Scenario: User switches to L2 mode
- **WHEN** active L2 exists and the user selects L2
- **THEN** L2 SHALL be selected exclusively

#### Scenario: User switches to L1 mode
- **WHEN** active L1 exists and the user selects L1
- **THEN** L1 SHALL be selected exclusively

#### Scenario: Two-level model filters unavailable single-level modes
- **WHEN** only L2 and L1 are active
- **THEN** options SHALL be Portafolio, Delivery, Full, L2 and L1, without L3

### Requirement: Portafolio mode shows L3 and L2 boards only
Portafolio SHALL render only active boards from L3/L2 and SHALL NOT render L1/L0. It SHALL be unavailable when neither L3 nor L2 is active.

#### Scenario: L3 and L2 visible in Portafolio mode
- **WHEN** L3 and L2 are active and Portafolio is selected
- **THEN** both boards SHALL be present

#### Scenario: L1 and L0 hidden in Portafolio mode
- **WHEN** Portafolio is selected
- **THEN** L1 and L0 boards SHALL NOT be present

#### Scenario: Portafolio intersects a partial hierarchy
- **WHEN** only L2 and L1 are active and Portafolio is selected
- **THEN** only L2 SHALL be rendered

### Requirement: Delivery mode shows L2, L1, and L0 boards only
Delivery SHALL render only active boards from L2/L1/L0 and SHALL NOT render L3. It SHALL be unavailable when none of L2/L1/L0 is active.

#### Scenario: L2, L1, L0 visible in Delivery mode
- **WHEN** L2, L1 and L0 are active and Delivery is selected
- **THEN** all three boards SHALL be present

#### Scenario: L3 hidden in Delivery mode
- **WHEN** Delivery is selected
- **THEN** L3 SHALL NOT be rendered

#### Scenario: Two-level delivery view
- **WHEN** only L2 and L1 are active and Delivery is selected
- **THEN** only L2 and L1 SHALL be rendered

### Requirement: Full mode shows all four boards
Full SHALL render every active configured board in descending hierarchy order, with no absent or disabled workflow rendered. With all four levels active it SHALL render L3, L2, L1 and L0.

#### Scenario: All boards visible in Full mode
- **WHEN** all four levels are active and Full is selected
- **THEN** all four boards SHALL be present

#### Scenario: No boards hidden in Full mode
- **WHEN** Full is selected
- **THEN** no active board SHALL be absent from the render tree

#### Scenario: Full shows only the configured two levels
- **WHEN** only L2 and L1 are active and Full is selected
- **THEN** L2 SHALL appear above L1, without L3 or L0 boards

### Requirement: L3 mode shows only the L3 board
When L3 is active, L3 mode SHALL render only L3. When L3 is inactive, this mode SHALL NOT be offered.

#### Scenario: Only L3 board visible in L3 mode
- **WHEN** active L3 is selected as the view
- **THEN** only the L3 board SHALL be present

### Requirement: L2 mode shows only the L2 board
When L2 is active, L2 mode SHALL render only L2. When L2 is inactive, this mode SHALL NOT be offered.

#### Scenario: Only L2 board visible in L2 mode
- **WHEN** active L2 is selected as the view
- **THEN** only the L2 board SHALL be present

### Requirement: L1 mode shows only the L1 board
When L1 is active, L1 mode SHALL render only L1. When L1 is inactive, this mode SHALL NOT be offered.

#### Scenario: Only L1 board visible in L1 mode
- **WHEN** active L1 is selected as the view
- **THEN** only the L1 board SHALL be present

## ADDED Requirements

### Requirement: Unavailable selected view falls back to Full
If a model switch or Without L0 toggle makes the selected view's active intersection empty, the UI SHALL select Full before rendering the next boards. A view-only selection SHALL NOT change simulation state.

#### Scenario: Switching away from L3 falls back safely
- **WHEN** L3 view is selected and the user switches to an L2/L1 model
- **THEN** the selection SHALL become Full and both new boards SHALL render

#### Scenario: Valid view is retained
- **WHEN** L2 view is selected and the user switches to another model with active L2
- **THEN** L2 view SHALL remain selected

#### Scenario: Sole L0 has usable views
- **WHEN** only L0 is configured
- **THEN** Delivery and Full SHALL be available and SHALL render L0, with no empty Portafolio or single-level options
