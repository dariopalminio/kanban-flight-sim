## ADDED Requirements

### Requirement: Status schema accepts optional definitionOfDone field
The `Status` type in `domain/types.ts` SHALL include an optional `definitionOfDone?: string` field. The field is optional; omitting it is equivalent to having no DoD configured for that status. Simulation configuration files MAY include `definitionOfDone` on any status.

#### Scenario: Status with definitionOfDone field is valid configuration
- **WHEN** a status object in `defaultConfig.json` includes a `definitionOfDone` string field
- **THEN** the application SHALL load and use that field without error

#### Scenario: Status without definitionOfDone field is valid configuration
- **WHEN** a status object in `defaultConfig.json` omits the `definitionOfDone` field
- **THEN** the application SHALL load that status normally with `definitionOfDone` equal to `undefined`
