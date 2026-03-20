## ADDED Requirements

### Requirement: Optional split field on status definition
Each status entry in `defaultConfig.json` MAY include `"split": true`. When present and `true`, the config loader SHALL expand that status into two sub-statuses (Doing and Ready) as described in the `split-column` spec. The `split` field is optional; omitting it or setting it to `false` preserves the existing behavior exactly.

#### Scenario: Status with split true is valid configuration
- **WHEN** a status entry in `defaultConfig.json` has `"split": true`
- **THEN** the config loads without error and the workflow has one additional status compared to the JSON definition

#### Scenario: Status without split field loads as before
- **WHEN** a status entry does not include a `split` field
- **THEN** the loaded `Status` object is identical to previous behavior — no `splitGroup`, no `splitRole`, same `order`
