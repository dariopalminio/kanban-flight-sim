## MODIFIED Requirements

### Requirement: DoD button toggles a panel showing the full DoD text
Clicking the "DoD" button SHALL toggle the visibility of a floating overlay panel that displays the full text of `status.definitionOfDone`. Clicking again SHALL hide the panel. Clicking anywhere outside the panel or button SHALL also hide the panel. The panel SHALL be rendered outside the column's DOM subtree (via a React Portal at `document.body`) so that it is never clipped by the column's `overflow: hidden` boundary. The panel SHALL be anchored visually below and near the DoD button using `position: fixed` coordinates derived from the button's viewport position. The panel SHALL have a `min-width` of 220px and a `max-width` of 360px, independent of column width.

#### Scenario: First click shows the DoD floating panel
- **WHEN** the user clicks the "DoD" button on a column whose DoD panel is hidden
- **THEN** a floating overlay panel SHALL become visible showing the full `definitionOfDone` text, positioned below the DoD button and not clipped by the column boundary

#### Scenario: Second click hides the DoD floating panel
- **WHEN** the user clicks the "DoD" button on a column whose DoD panel is currently visible
- **THEN** the panel SHALL be hidden

#### Scenario: Outside click hides the DoD floating panel
- **WHEN** the DoD panel is visible and the user clicks anywhere outside the panel and outside the DoD button
- **THEN** the panel SHALL be hidden

#### Scenario: DoD panel displays complete text regardless of column width
- **WHEN** the DoD panel is visible on a narrow column (e.g., one of 10+ columns in SDF workflows)
- **THEN** the full value of `status.definitionOfDone` SHALL be rendered as text with no truncation and no clipping, at a width between 220px and 360px

#### Scenario: DoD panel is not confined to column width
- **WHEN** the DoD panel is visible
- **THEN** the panel SHALL extend beyond the column's horizontal bounds if necessary, unaffected by the column's `overflow: hidden` CSS property
