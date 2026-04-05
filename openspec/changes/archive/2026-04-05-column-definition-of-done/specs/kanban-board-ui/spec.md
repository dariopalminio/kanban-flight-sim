## ADDED Requirements

### Requirement: Column header includes DoD button as optional element
The column header SHALL support a "DoD" button as an optional UI element that appears only when `status.definitionOfDone` is a non-empty string. This button SHALL be rendered after the existing buffer indicator (`✓`). Header layout SHALL remain unchanged for columns that do not have a `definitionOfDone`.

#### Scenario: Header layout unchanged when no DoD defined
- **WHEN** a column has no `definitionOfDone` field
- **THEN** the column header SHALL render identically to its previous layout (name, WIP count, optional buffer indicator)

#### Scenario: Header includes DoD button when DoD is defined
- **WHEN** a column has a non-empty `definitionOfDone` field
- **THEN** the column header SHALL include the "DoD" button as an additional element after any existing indicators
