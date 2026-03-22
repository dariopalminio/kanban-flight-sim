## ADDED Requirements

### Requirement: Column header shows status description as tooltip on hover
Each column header SHALL expose the status `description` (from configuration) as a native browser tooltip via the HTML `title` attribute on the header container element. When a user hovers over the column header text or cell, the browser SHALL display the description text. If the status has no `description` or it is an empty string, the `title` attribute SHALL be omitted so that no blank tooltip is shown.

#### Scenario: Column header tooltip shows description on hover
- **WHEN** a status has a non-empty `description` field in the configuration
- **THEN** the column header element has a `title` attribute equal to that description, and hovering over the header displays it as a browser tooltip

#### Scenario: No tooltip when description is absent or empty
- **WHEN** a status has no `description` field or its value is an empty string
- **THEN** the column header element has no `title` attribute set
