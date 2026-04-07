## MODIFIED Requirements

### Requirement: Column header with name and optional WIP display
Each column header SHALL display the status name. If the status has a `wipLimit`, the header SHALL show `<name> [<current>/<limit>]` where `<limit>` is rendered as an editable `<input type="number">` (not static text) that allows the user to change the WIP limit at runtime. If `isBeforeCommitmentPoint` is true the column name text SHALL be underlined. If `isBuffer` is true, the header SHALL additionally show a `✓` indicator in green (`#22c55e`) after the name (and after the WIP display if present). If the status has a non-empty `description`, the header container element SHALL include a `title` attribute set to that description; if the description is absent or empty the `title` attribute SHALL be omitted.

#### Scenario: WIP limit column shows current count and editable limit
- **WHEN** a column with `wipLimit: 1` (effective) contains 1 item
- **THEN** the header displays `In-Progress [1/` followed by an `<input>` showing `1` `]`

#### Scenario: Commitment-point column name is underlined
- **WHEN** a status has `isBeforeCommitmentPoint: true`
- **THEN** the column header text has `text-decoration: underline`

#### Scenario: Buffer column header shows ✓ after name
- **WHEN** a status has `isBuffer: true`
- **THEN** the column header shows the status name followed by a green `✓` symbol

#### Scenario: Column header tooltip shows description on hover
- **WHEN** a status has a non-empty `description` field in the configuration
- **THEN** the column header element has a `title` attribute equal to that description

#### Scenario: No tooltip when description is absent or empty
- **WHEN** a status has no `description` field or its value is an empty string
- **THEN** the column header element has no `title` attribute set

#### Scenario: Columns without wipLimit show no input
- **WHEN** a status has no `wipLimit` defined in the config
- **THEN** the column header renders the item count as `[c: <current>]` with no editable input

#### Scenario: Board passes onWipLimitChange to Column
- **WHEN** `Board` receives an `onWipLimitChange` prop from `App`
- **THEN** each `Column` rendered by that `Board` receives the `onWipLimitChange` callback as a prop
