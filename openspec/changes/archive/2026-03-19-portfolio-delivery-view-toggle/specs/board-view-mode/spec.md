## ADDED Requirements

### Requirement: View mode radio button group
The UI SHALL display a radio button group with exactly two options: **Portafolio** and **Delivery**. Only one option can be selected at a time. The default selection on load SHALL be **Portafolio**.

#### Scenario: Portafolio selected by default on load
- **WHEN** the application first renders
- **THEN** the "Portafolio" radio button is checked and "Delivery" is unchecked

#### Scenario: User switches to Delivery mode
- **WHEN** the user selects the "Delivery" radio button
- **THEN** the "Delivery" radio button becomes checked and "Portafolio" becomes unchecked

#### Scenario: User switches back to Portafolio mode
- **WHEN** the user selects the "Portafolio" radio button after "Delivery" was active
- **THEN** the "Portafolio" radio button becomes checked and "Delivery" becomes unchecked

---

### Requirement: Portafolio mode shows L3 and L2 boards only
When the active view mode is **Portafolio**, the UI SHALL render the L3 and L2 boards and SHALL NOT render the L1 or L0 boards.

#### Scenario: L3 and L2 visible in Portafolio mode
- **WHEN** view mode is "Portafolio"
- **THEN** the L3 board and L2 board are present in the DOM

#### Scenario: L1 and L0 hidden in Portafolio mode
- **WHEN** view mode is "Portafolio"
- **THEN** the L1 board and L0 board are NOT present in the DOM

---

### Requirement: Delivery mode shows L2, L1, and L0 boards only
When the active view mode is **Delivery**, the UI SHALL render the L2, L1, and L0 boards and SHALL NOT render the L3 board.

#### Scenario: L2, L1, L0 visible in Delivery mode
- **WHEN** view mode is "Delivery"
- **THEN** the L2 board, L1 board, and L0 board are present in the DOM

#### Scenario: L3 hidden in Delivery mode
- **WHEN** view mode is "Delivery"
- **THEN** the L3 board is NOT present in the DOM

---

### Requirement: View mode change does not reset simulation state
Switching between view modes SHALL NOT reset or alter the current simulation state (tick count, workitem positions, or configuration).

#### Scenario: Simulation state preserved after view mode change
- **WHEN** the simulation is at tick 5 and the user switches view mode
- **THEN** the tick count and workitem positions remain unchanged after the mode switch
