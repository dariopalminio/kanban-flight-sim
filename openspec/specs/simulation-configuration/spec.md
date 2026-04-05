## ADDED Requirements

### Requirement: JSON-driven multi-simulation configuration
All simulations SHALL be defined in `src/config/defaultConfig.json`. The JSON contains a `simulations` array and a `defaultSimulation` field naming the active simulation on startup. No code changes are required to add a new simulation.

#### Scenario: New simulation added without code changes
- **WHEN** a new entry is appended to the `simulations` array in `defaultConfig.json`
- **THEN** the new simulation appears in the dropdown and is fully functional without modifying any TypeScript source file

#### Scenario: Default simulation loaded on startup — name matches
- **WHEN** the application initializes and `defaultSimulation` matches a simulation in the array
- **THEN** that simulation is loaded and active

#### Scenario: Default simulation not found — fallback applied
- **WHEN** the application initializes and `defaultSimulation` does not match any simulation in the array
- **THEN** the first simulation in the `simulations` array is loaded, and a warning is surfaced to the UI via `configLoadResult.error`

---

### Requirement: Simulation parameters
Each simulation entry SHALL include the following top-level parameters:

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | Display name shown in the selector dropdown |
| `defaultSimulation` | string | — | (top-level) name of the simulation to load by default |
| `initialReleaseCount` | number | 1 | Number of L3 workitems created at simulation start (one-time, at reset) |
| `advanceProbability` | number | 0.5 | Probability (0–1) that an eligible item advances each tick |
| `childrenPerParent` | number | 3 | Number of child workitems spawned at the commitment point |
| `demandInterval` | number | 0 | Ticks between automatic L3 injections. `0` disables continuous demand |

#### Scenario: advanceProbability controls advance rate
- **WHEN** `advanceProbability` is set to `1.0`
- **THEN** every eligible workitem advances on every tick

#### Scenario: demandInterval of 0 disables automatic injection
- **WHEN** `demandInterval` is `0` in the simulation config
- **THEN** no new L3 items are created automatically during simulation

---

### Requirement: Workflow definition per level
Each simulation SHALL define four workflows under a `workflows` object with keys `L3`, `L2`, `L1`, `L0`. Each workflow has:

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
The `statusCategory` field SHALL be stored explicitly in `defaultConfig.json` for every status. The config loader (`defaultConfig.ts`) SHALL read this field directly and map it to the `category` field of the domain `Status` type. The automatic derivation logic (`assignCategory()`) SHALL be removed.

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

### Requirement: Bundled simulations
The default configuration SHALL include at least two pre-built simulations:

- **"Simplified"** — 4 statuses per level (`Backlog → Committed → In-Progress → Done`), WIP limits on In-Progress of L3 and L2 (wipLimit=1 each)
- **"SDF workflows"** — complex multi-status workflows: L3 (7 statuses), L2 (10 statuses), L1 (8 statuses), L0 (7 statuses), with WIP limits on key downstream columns

#### Scenario: Simplified simulation loads with 4 statuses per level
- **WHEN** the "Simplified" simulation is selected
- **THEN** each of the four workflows has exactly 4 statuses

---

### Requirement: Optional hasReadySignal field on status definition
Each status entry in `defaultConfig.json` MAY include `"hasReadySignal": true`. When present and `true`, workitems in that status go through two-phase advancement as described in the `ready-signal` spec. The field is optional; omitting it preserves existing behavior exactly.

#### Scenario: Status with hasReadySignal true is valid configuration
- **WHEN** a status entry has `"hasReadySignal": true`
- **THEN** the config loads without error and the status is recognized by the engine for two-phase advancement

#### Scenario: Status without hasReadySignal loads as before
- **WHEN** a status entry does not include `hasReadySignal`
- **THEN** the loaded `Status` has no `hasReadySignal` field and advances in a single phase as before

---

### Requirement: Optional isBuffer field on status definition
Each status entry in `defaultConfig.json` MAY include `"isBuffer": true`. When present, the column is treated as a ready buffer (all items implicitly ready to be pulled). The field is optional; omitting it preserves existing behavior exactly.

#### Scenario: Status with isBuffer true is valid configuration
- **WHEN** a status entry has `"isBuffer": true`
- **THEN** the config loads without error and `status.isBuffer` is `true` in the loaded workflow

#### Scenario: Status without isBuffer loads as before
- **WHEN** a status entry does not include `isBuffer`
- **THEN** the loaded `Status` has no `isBuffer` field and no visual or behavioral change occurs

---

### Requirement: Status schema accepts optional definitionOfDone field
The `Status` type in `domain/types.ts` SHALL include an optional `definitionOfDone?: string` field. The field is optional; omitting it is equivalent to having no DoD configured for that status. Simulation configuration files MAY include `definitionOfDone` on any status.

#### Scenario: Status with definitionOfDone field is valid configuration
- **WHEN** a status object in `defaultConfig.json` includes a `definitionOfDone` string field
- **THEN** the application SHALL load and use that field without error

#### Scenario: Status without definitionOfDone field is valid configuration
- **WHEN** a status object in `defaultConfig.json` omits the `definitionOfDone` field
- **THEN** the application SHALL load that status normally with `definitionOfDone` equal to `undefined`
