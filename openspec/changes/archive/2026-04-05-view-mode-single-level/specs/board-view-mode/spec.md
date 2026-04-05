## MODIFIED Requirements

### Requirement: View mode selector
The UI SHALL display a `<select>` dropdown with exactly six options: **Portafolio**, **Delivery**, **Full**, **L3**, **L2**, **L1**. Only one option can be selected at a time. The default selection on load SHALL be **Delivery**.

#### Scenario: Default selection on load
- **WHEN** the application first renders
- **THEN** the "Delivery" option SHALL be selected

#### Scenario: User switches to L3 mode
- **WHEN** the user selects the "L3" option
- **THEN** the "L3" option becomes selected and all other options are deselected

#### Scenario: User switches to L2 mode
- **WHEN** the user selects the "L2" option
- **THEN** the "L2" option becomes selected and all other options are deselected

#### Scenario: User switches to L1 mode
- **WHEN** the user selects the "L1" option
- **THEN** the "L1" option becomes selected and all other options are deselected

## ADDED Requirements

### Requirement: L3 mode shows only the L3 board
When the active view mode is **L3**, the UI SHALL render only the L3 board and SHALL NOT render the L2, L1, or L0 boards.

#### Scenario: Only L3 board visible in L3 mode
- **WHEN** view mode is "L3"
- **THEN** the L3 board SHALL be present in the DOM
- **AND** the L2, L1, and L0 boards SHALL NOT be present in the DOM

### Requirement: L2 mode shows only the L2 board
When the active view mode is **L2**, the UI SHALL render only the L2 board and SHALL NOT render the L3, L1, or L0 boards.

#### Scenario: Only L2 board visible in L2 mode
- **WHEN** view mode is "L2"
- **THEN** the L2 board SHALL be present in the DOM
- **AND** the L3, L1, and L0 boards SHALL NOT be present in the DOM

### Requirement: L1 mode shows only the L1 board
When the active view mode is **L1**, the UI SHALL render only the L1 board and SHALL NOT render the L3, L2, or L0 boards.

#### Scenario: Only L1 board visible in L1 mode
- **WHEN** view mode is "L1"
- **THEN** the L1 board SHALL be present in the DOM
- **AND** the L3, L2, and L0 boards SHALL NOT be present in the DOM

### Requirement: View mode change does not reset simulation state (single-level modes)
Switching to or from any single-level view mode (L3, L2, L1) SHALL NOT reset or alter the current simulation state.

#### Scenario: Simulation state preserved when switching to single-level mode
- **WHEN** the simulation is at tick 5 and the user switches to "L2" mode
- **THEN** the tick count and workitem positions remain unchanged
