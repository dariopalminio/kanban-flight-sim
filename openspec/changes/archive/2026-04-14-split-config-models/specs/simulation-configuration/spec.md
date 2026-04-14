## MODIFIED Requirements

### Requirement: JSON-driven multi-model configuration
All simulation models SHALL be defined as individual files in `src/config/models/`. The root `defaultConfig.json` SHALL contain only `{ "defaultModel": "<name>" }` — a single string field naming the active model on startup. No code changes are required to add a new model.

#### Scenario: New model added without code changes
- **WHEN** a new file is added to `src/config/models/` with a valid model definition
- **THEN** the new model appears in the dropdown and is fully functional without modifying any TypeScript source file

#### Scenario: Default model loaded on startup — name matches
- **WHEN** the application initializes and `defaultModel` in `defaultConfig.json` matches a model name found in `src/config/models/`
- **THEN** that model is loaded and active

#### Scenario: Default model not found — fallback applied
- **WHEN** the application initializes and `defaultModel` does not match any loaded model name
- **THEN** the first model (alphabetical by filename) is loaded, and a warning is surfaced to the UI via `configLoadResult.error`

---

### Requirement: Model parameters (unchanged)
Each model file SHALL include the following top-level parameters:

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | Display name shown in the selector dropdown |
| `initialReleaseCount` | number | 1 | Number of L3 workitems created at simulation start (one-time, at reset) |
| `advanceProbability` | number | 0.5 | Probability (0–1) that an eligible item advances each tick |
| `childrenPerParent` | number | 3 | Number of child workitems spawned at the commitment point |
| `demandInterval` | number | 0 | Ticks between automatic L3 injections. `0` disables continuous demand |

#### Scenario: advanceProbability controls advance rate
- **WHEN** `advanceProbability` is set to `1.0`
- **THEN** every eligible workitem advances on every tick

#### Scenario: demandInterval of 0 disables automatic injection
- **WHEN** `demandInterval` is `0` in the model config
- **THEN** no new L3 items are created automatically during simulation

---

### Requirement: Workflow definition per level (unchanged)
Each model file SHALL define four workflows under a `workflows` object with keys `L3`, `L2`, `L1`, `L0`. Each workflow has:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique workflow identifier |
| `name` | string | Display name (shown in board header) |
| `level` | `L0`\|`L1`\|`L2`\|`L3` | Hierarchical level |
| `workitemName` | string | Type name (first 4 chars become ID prefix) |
| `statuses` | Status[] | Ordered list of statuses |

#### Scenario: Workflow must have at least one status
- **WHEN** a workflow is loaded
- **THEN** `statuses` has at least one entry

---

### Requirement: Status properties (unchanged)
Each status in a workflow SHALL have the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier within the workflow |
| `name` | string | yes | Display label in the column header |
| `order` | number | yes | Sequential position (used for advancement logic) |
| `streamType` | `UPSTREAM`\|`DOWNSTREAM` | yes | Zone of the workflow |
| `statusCategory` | `TODO`\|`IN_PROGRESS`\|`DONE` | yes | Explicit category used for column highlight |
| `isBeforeCommitmentPoint` | boolean | yes | `true` for the one status immediately before the commitment point; children are spawned here |
| `isPosDeliveryPoint` | boolean | yes | `true` for the final/delivery status; item stops here |
| `wipLimit` | number | no | If set, caps concurrent items in this column |

Exactly one status per workflow SHALL have `isBeforeCommitmentPoint: true`. Exactly one status per workflow SHALL have `isPosDeliveryPoint: true`.

#### Scenario: Commitment point uniqueness
- **WHEN** a workflow is loaded
- **THEN** exactly one status has `isBeforeCommitmentPoint: true`

#### Scenario: Delivery point uniqueness
- **WHEN** a workflow is loaded
- **THEN** exactly one status has `isPosDeliveryPoint: true`

#### Scenario: statusCategory field is present on every status
- **WHEN** the configuration is loaded
- **THEN** every `Status` object has a `category` field with value `"TODO"`, `"IN_PROGRESS"`, or `"DONE"`, sourced from `statusCategory` in the JSON

---

### Requirement: Automatic `category` derivation (unchanged)
The `statusCategory` field SHALL be stored explicitly in each model JSON file for every status. The config loader (`defaultConfig.ts`) SHALL read this field directly and map it to the `category` field of the domain `Status` type.

#### Scenario: statusCategory "TODO" is preserved
- **WHEN** a status in the JSON has `"statusCategory": "TODO"`
- **THEN** the loaded `Status` has `category: "TODO"`

#### Scenario: statusCategory "IN_PROGRESS" is preserved
- **WHEN** a status in the JSON has `"statusCategory": "IN_PROGRESS"`
- **THEN** the loaded `Status` has `category: "IN_PROGRESS"`

#### Scenario: statusCategory "DONE" is preserved
- **WHEN** a status in the JSON has `"statusCategory": "DONE"`
- **THEN** the loaded `Status` has `category: "DONE"`

---

### Requirement: Bundled models
The default configuration SHALL include at least three pre-built models as individual files:

- **"Essential Kanban FL"** — `src/config/models/essential-kanban-fl.json`
- **"SDDF workflows"** — `src/config/models/sddf-workflows.json`
- **"SAFe FL workflows"** — `src/config/models/safe-fl-workflows.json`

#### Scenario: All three bundled models load on startup
- **WHEN** the application initialises
- **THEN** `simulationNames` contains exactly `["Essential Kanban FL", "SDDF workflows", "SAFe FL workflows"]` (or a superset if more models are present)

---

### Requirement: Optional status fields preserved (unchanged)
Each status entry in a model file MAY include `"hasReadySignal": true`, `"isBuffer": true`, and/or `"definitionOfDone": string`. These optional fields are loaded and applied exactly as before.

#### Scenario: Optional status fields load without error
- **WHEN** a status entry in a model file includes `hasReadySignal`, `isBuffer`, or `definitionOfDone`
- **THEN** the config loads without error and those fields are available on the loaded `Status` object

## REMOVED Requirements

### Requirement: Simulations array in defaultConfig.json
**Reason:** Models are now stored as individual files under `src/config/models/`. The monolithic `simulations` array is replaced by per-file loading via `import.meta.glob`.
**Migration:** Extract each element of the `simulations` array into `src/config/models/<slug>.json`. Remove the `simulations` key from `defaultConfig.json`. Rename `defaultSimulation` to `defaultModel`.
