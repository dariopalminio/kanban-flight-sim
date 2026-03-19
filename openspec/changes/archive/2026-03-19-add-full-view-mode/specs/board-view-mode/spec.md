## MODIFIED Requirements

### Requirement: View mode radio button group
The UI SHALL display a radio button group with exactly three options: **Portafolio**, **Delivery**, and **Full**. Only one option can be selected at a time. The default selection on load SHALL be **Portafolio**.

#### Scenario: Portafolio selected by default on load
- **WHEN** the application first renders
- **THEN** the "Portafolio" radio button is checked and "Delivery" and "Full" are unchecked

#### Scenario: User switches to Delivery mode
- **WHEN** the user selects the "Delivery" radio button
- **THEN** the "Delivery" radio button becomes checked and the others become unchecked

#### Scenario: User switches to Full mode
- **WHEN** the user selects the "Full" radio button
- **THEN** the "Full" radio button becomes checked and the others become unchecked

---

## ADDED Requirements

### Requirement: Full mode shows all four boards
When the active view mode is **Full**, the UI SHALL render all four boards (L3, L2, L1, L0) simultaneously.

#### Scenario: All boards visible in Full mode
- **WHEN** view mode is "Full"
- **THEN** the L3, L2, L1, and L0 boards are all present in the DOM

#### Scenario: No boards hidden in Full mode
- **WHEN** view mode is "Full"
- **THEN** no board is absent from the render tree
