## ADDED Requirements

### Requirement: Each model lives in its own JSON file
Each simulation model SHALL be stored as an individual JSON file under `src/config/models/<slug>.json`. The file format SHALL be identical to a single element of the former `simulations` array: `{ name, initialReleaseCount, advanceProbability, childrenPerParent, demandInterval?, workflows }`. No additional wrapper or metadata fields are required.

#### Scenario: Model file has the correct shape
- **WHEN** a file `src/config/models/any-model.json` is loaded
- **THEN** it SHALL contain a `name` string, numeric simulation parameters, and a `workflows` object with keys `L3`, `L2`, `L1`, `L0`

#### Scenario: Adding a new model requires no TypeScript changes
- **WHEN** a developer adds a new `src/config/models/<slug>.json` with a valid model definition
- **THEN** the new model SHALL appear in `simulationNames` and be selectable in the UI without modifying any TypeScript source file

---

### Requirement: Loader collects all model files via glob
The loader (`src/config/defaultConfig.ts`) SHALL use `import.meta.glob('../../config/models/*.json', { eager: true })` (or equivalent relative path) to import all model files at build-time. The result SHALL be equivalent to the former `simulations` array loaded from `defaultConfig.json`.

#### Scenario: All model files are loaded on startup
- **WHEN** the application initialises
- **THEN** `simulationNames` SHALL contain the names of all models found in `src/config/models/`

#### Scenario: Model files are ordered alphabetically by filename
- **WHEN** multiple model files exist in `src/config/models/`
- **THEN** `simulationNames` SHALL reflect alphabetical filename order so the list is deterministic across environments

---

### Requirement: Invalid model file surfaces an error
If any file under `src/config/models/` contains invalid JSON or is missing required fields, the loader SHALL catch the error and expose it via `configLoadResult.error`, matching the existing error-surfacing contract.

#### Scenario: Malformed JSON in a model file
- **WHEN** a `src/config/models/*.json` file contains invalid JSON
- **THEN** `configLoadResult.error` SHALL be a non-empty string and `configLoadResult.config` SHALL be `null`
