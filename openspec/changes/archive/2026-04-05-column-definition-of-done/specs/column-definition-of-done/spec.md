## ADDED Requirements

### Requirement: Column header shows DoD button when definitionOfDone is present
When a status has a non-empty `definitionOfDone` field, the column header SHALL display a small "DoD" button after all other header elements. Columns without a `definitionOfDone` field (or with an empty string) SHALL NOT show any DoD button.

#### Scenario: DoD button appears on column with definitionOfDone configured
- **WHEN** a status has a non-empty `definitionOfDone` string in `defaultConfig.json`
- **THEN** the column header SHALL render a "DoD" button after the WIP count and buffer indicator elements

#### Scenario: DoD button absent on column without definitionOfDone
- **WHEN** a status has no `definitionOfDone` field or its value is empty
- **THEN** the column header SHALL NOT render any DoD button

---

### Requirement: DoD button toggles a panel showing the full DoD text
Clicking the "DoD" button SHALL toggle the visibility of a panel within the column that displays the full text of `status.definitionOfDone`. Clicking again SHALL hide the panel. The panel SHALL appear below the header and above the cards area.

#### Scenario: First click shows the DoD panel
- **WHEN** the user clicks the "DoD" button on a column whose DoD panel is hidden
- **THEN** a panel SHALL become visible inside the column showing the full `definitionOfDone` text

#### Scenario: Second click hides the DoD panel
- **WHEN** the user clicks the "DoD" button on a column whose DoD panel is currently visible
- **THEN** the panel SHALL be hidden

#### Scenario: DoD panel displays complete text
- **WHEN** the DoD panel is visible
- **THEN** the full value of `status.definitionOfDone` SHALL be rendered as text inside the panel with no truncation
