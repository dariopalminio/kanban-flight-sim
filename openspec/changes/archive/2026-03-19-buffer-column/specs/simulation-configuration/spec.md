## ADDED Requirements

### Requirement: Optional isBuffer field on status definition
Each status entry in `defaultConfig.json` MAY include `"isBuffer": true`. When present, the column is treated as a ready buffer (all items implicitly ready to be pulled). The field is optional; omitting it preserves existing behavior exactly.

#### Scenario: Status with isBuffer true is valid configuration
- **WHEN** a status entry has `"isBuffer": true`
- **THEN** the config loads without error and `status.isBuffer` is `true` in the loaded workflow

#### Scenario: Status without isBuffer loads as before
- **WHEN** a status entry does not include `isBuffer`
- **THEN** the loaded `Status` has no `isBuffer` field and no visual or behavioral change occurs
