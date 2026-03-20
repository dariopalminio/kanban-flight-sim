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

---

### Requirement: Automatic `category` derivation
The `category` field SHALL NOT be stored in `defaultConfig.json`. It is computed at load time by `defaultConfig.ts` using the following rules:

- `TODO` — all statuses with `streamType: UPSTREAM`
- `DONE` — the last status in the array (which has `isPosDeliveryPoint: true`)
- `IN_PROGRESS` — all remaining downstream statuses (not the last)

#### Scenario: UPSTREAM statuses become TODO
- **WHEN** a status has `streamType: "UPSTREAM"`
- **THEN** its derived `category` is `"TODO"`

#### Scenario: Last status becomes DONE
- **WHEN** a status is the last in its workflow's statuses array
- **THEN** its derived `category` is `"DONE"`

#### Scenario: Non-last downstream statuses become IN_PROGRESS
- **WHEN** a downstream status is not the last in the array
- **THEN** its derived `category` is `"IN_PROGRESS"`

---

### Requirement: Bundled simulations
The default configuration SHALL include at least two pre-built simulations:

- **"Simplified"** — 4 statuses per level (`Backlog → Committed → In-Progress → Done`), WIP limits on In-Progress of L3 and L2 (wipLimit=1 each)
- **"SDF workflows"** — complex multi-status workflows: L3 (7 statuses), L2 (10 statuses), L1 (8 statuses), L0 (7 statuses), with WIP limits on key downstream columns

#### Scenario: Simplified simulation loads with 4 statuses per level
- **WHEN** the "Simplified" simulation is selected
- **THEN** each of the four workflows has exactly 4 statuses
