## ADDED Requirements

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

### Requirement: Model parameters
Each model file SHALL include `name`, `initialReleaseCount`, `advanceProbability` and `childrenPerParent`, with optional `demandInterval` defaulting to 0. `initialReleaseCount` SHALL specify the number of items created at the highest active level on initialization/reset. `advanceProbability` SHALL control eligible probabilistic advancement in Steps 1, 3, 5 and 7. `childrenPerParent` SHALL retain its existing meaning for active parent-child relationships. `demandInterval` SHALL control periodic injection at the highest active level in Step 8.

The parameter types and documented defaults SHALL remain unchanged:

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | string | None | Display name shown in the selector |
| `initialReleaseCount` | number | 1 | Initial highest-active-level item count |
| `advanceProbability` | number | 0.5 | Probability from 0 to 1 for eligible advancement |
| `childrenPerParent` | number | 3 | Requested child batch size at commitment |
| `demandInterval` | number | 0 | Ticks between root demand injections; 0 disables demand |

#### Scenario: advanceProbability controls advance rate
- **WHEN** `advanceProbability` is 1.0 and an item is eligible for a probabilistic advancement phase in Step 1, 3, 5 or 7
- **THEN** that phase's probability draw SHALL succeed, without bypassing FIFO, WIP or ready-signal rules

#### Scenario: demandInterval of 0 disables automatic injection
- **WHEN** `demandInterval` is 0
- **THEN** Step 8 SHALL NOT create demand items

#### Scenario: Parameters apply to the two-level model
- **WHEN** the model defines only L2 and L1 with `initialReleaseCount = 2` and `demandInterval = 5`
- **THEN** initialization SHALL create two L2 roots and Step 8 SHALL target L2 on eligible ticks

---

### Requirement: Workflow definition per level
Each model file SHALL define a non-empty consecutive subset of L3, L2, L1, L0 under `workflows`. Missing outer levels SHALL be omitted, not synthesized. Each configured workflow SHALL contain `id`, `name`, matching `level`, `workitemName` and a non-empty ordered `statuses` list, retaining existing status and structural-key requirements. JSON key order SHALL NOT determine hierarchy order.

#### Scenario: Workflow must have at least one status
- **WHEN** a configured workflow is loaded
- **THEN** its `statuses` SHALL contain at least one entry and satisfy existing structural validation

#### Scenario: Two consecutive middle levels are accepted
- **WHEN** `workflows` contains only L1 and L2, in either key order
- **THEN** the configuration SHALL load with L2 above L1 and without L3/L0 placeholders

#### Scenario: A single level is accepted
- **WHEN** `workflows` contains exactly one valid workflow at any of L3, L2, L1 or L0
- **THEN** the configuration SHALL load with that level as both root and leaf

#### Scenario: Four-level compatibility
- **WHEN** a valid model defines L3, L2, L1 and L0
- **THEN** its workflows and hierarchy SHALL load without JSON migration

#### Scenario: Empty or gapped hierarchy is rejected
- **WHEN** `workflows` is empty or defines L3 and L1 without L2
- **THEN** loading SHALL fail with a descriptive model-specific configuration error

#### Scenario: Invalid level key or mismatching level is rejected
- **WHEN** a workflow has an unknown level key or its `level` differs from its map key
- **THEN** loading SHALL fail with an error identifying the offending key or level

---

### Requirement: Status properties
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

### Requirement: Automatic `category` derivation
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

### Requirement: Optional hasReadySignal field on status definition
Each status entry in a model file MAY include `"hasReadySignal": true`. When present and `true`, workitems in that status go through two-phase advancement as described in the `ready-signal` spec. The field is optional; omitting it preserves existing behavior exactly.

#### Scenario: Status with hasReadySignal true is valid configuration
- **WHEN** a status entry has `"hasReadySignal": true`
- **THEN** the config loads without error and the status is recognized by the engine for two-phase advancement

#### Scenario: Status without hasReadySignal loads as before
- **WHEN** a status entry does not include `hasReadySignal`
- **THEN** the loaded `Status` has no `hasReadySignal` field and advances in a single phase as before

---

### Requirement: Optional isBuffer field on status definition
Each status entry in a model file MAY include `"isBuffer": true`. When present, the column is treated as a ready buffer (all items implicitly ready to be pulled). The field is optional; omitting it preserves existing behavior exactly.

#### Scenario: Status with isBuffer true is valid configuration
- **WHEN** a status entry has `"isBuffer": true`
- **THEN** the config loads without error and `status.isBuffer` is `true` in the loaded workflow

#### Scenario: Status without isBuffer loads as before
- **WHEN** a status entry does not include `isBuffer`
- **THEN** the loaded `Status` has no `isBuffer` field and no visual or behavioral change occurs

---

### Requirement: Status schema accepts optional definitionOfDone field
The `Status` type in `domain/types.ts` SHALL include an optional `definitionOfDone?: string` field. The field is optional; omitting it is equivalent to having no DoD configured for that status. Model files MAY include `definitionOfDone` on any status.

#### Scenario: Status with definitionOfDone field is valid configuration
- **WHEN** a status object in a model file includes a `definitionOfDone` string field
- **THEN** the application SHALL load and use that field without error

#### Scenario: Status without definitionOfDone field is valid configuration
- **WHEN** a status object in a model file omits the `definitionOfDone` field
- **THEN** the application SHALL load that status normally with `definitionOfDone` equal to `undefined`

---

### Requirement: Optional status fields preserved
Each status entry in a model file MAY include `"hasReadySignal": true`, `"isBuffer": true`, and/or `"definitionOfDone": string`. These optional fields are loaded and applied exactly as before.

#### Scenario: Optional status fields load without error
- **WHEN** a status entry in a model file includes `hasReadySignal`, `isBuffer`, or `definitionOfDone`
- **THEN** the config loads without error and those fields are available on the loaded `Status` object
