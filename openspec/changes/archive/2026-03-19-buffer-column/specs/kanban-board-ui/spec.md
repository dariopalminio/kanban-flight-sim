## MODIFIED Requirements

### Requirement: Column header with name and optional WIP display
Each column header SHALL display the status name. If the status has a `wipLimit`, the header SHALL show `<name> [<current>/<limit>]`. If `isBeforeCommitmentPoint` is true the column name text SHALL be underlined. If `isBuffer` is true, the header SHALL additionally show a `✓` indicator in green (`#22c55e`) after the name (and after the WIP display if present).

#### Scenario: WIP limit column shows current and max counts (unchanged)
- **WHEN** a column with `wipLimit: 1` contains 1 item
- **THEN** the header displays `In-Progress [1/1]`

#### Scenario: Commitment-point column name is underlined (unchanged)
- **WHEN** a status has `isBeforeCommitmentPoint: true`
- **THEN** the column header text has `text-decoration: underline`

#### Scenario: Buffer column header shows ✓ after name
- **WHEN** a status has `isBuffer: true`
- **THEN** the column header shows the status name followed by a green `✓` symbol
