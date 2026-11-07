## MODIFIED Requirements

### Requirement: Each model lives in its own JSON file
Each simulation model SHALL be stored as an individual JSON file under `src/config/models/<slug>.json` with shape `{ name, initialReleaseCount, advanceProbability, childrenPerParent, demandInterval?, workflows }`. The workflow map SHALL contain one to four consecutive recognized levels. No additional wrapper, hierarchy parameter or placeholder workflow SHALL be required.

#### Scenario: Model file has the correct shape
- **WHEN** a valid model file contains the required parameters and a consecutive non-empty workflow map
- **THEN** it SHALL load as a simulation model

#### Scenario: Adding a new model requires no TypeScript changes
- **WHEN** a developer adds a valid model file with one to four consecutive workflows
- **THEN** the model SHALL appear in `simulationNames` and be selectable without modifying TypeScript source

#### Scenario: Current SDDF file loads without filler levels
- **WHEN** `sddf-workflows.json` defines only valid L2 and L1 workflows
- **THEN** loading SHALL accept the file without requiring L3 or L0

### Requirement: Invalid model file surfaces an error
Invalid JSON or missing/invalid required model or configured-workflow fields SHALL produce a descriptive configuration error through the existing configuration-error UI contract. Startup load failures SHALL expose a non-empty `configLoadResult.error` with `configLoadResult.config` equal to `null`; selected-model load failures SHALL identify the model and invalid field or level. Omitted outer workflows SHALL NOT count as missing required fields.

#### Scenario: Malformed JSON in a model file
- **WHEN** a model file contains invalid JSON
- **THEN** the configuration-error path SHALL expose a readable error instead of a successful configuration

#### Scenario: Empty hierarchy fails descriptively
- **WHEN** the startup model has an empty `workflows` object
- **THEN** `configLoadResult.config` SHALL be `null` and its error SHALL identify the model and the need for at least one workflow

#### Scenario: Interior gap fails descriptively
- **WHEN** a selected model defines L3 and L1 without L2
- **THEN** loading SHALL report the missing intermediate L2 workflow rather than an undefined-property error

#### Scenario: Present but invalid workflow is not treated as omitted
- **WHEN** a configured workflow is `null`, lacks required fields or has an empty `statuses` list
- **THEN** loading SHALL report the offending model/level and SHALL NOT fabricate or silently skip that workflow
