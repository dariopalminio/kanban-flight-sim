## ADDED Requirements

### Requirement: Optional hasReadySignal field on status definition
Each status entry in `defaultConfig.json` MAY include `"hasReadySignal": true`. When present and `true`, workitems in that status go through two-phase advancement as described in the `ready-signal` spec. The field is optional; omitting it preserves existing behavior exactly.

#### Scenario: Status with hasReadySignal true is valid configuration
- **WHEN** a status entry has `"hasReadySignal": true`
- **THEN** the config loads without error and the status is recognized by the engine for two-phase advancement

#### Scenario: Status without hasReadySignal loads as before
- **WHEN** a status entry does not include `hasReadySignal`
- **THEN** the loaded `Status` has no `hasReadySignal` field and advances in a single phase as before
