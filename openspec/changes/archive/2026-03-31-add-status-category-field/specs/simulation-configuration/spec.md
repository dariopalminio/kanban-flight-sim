## MODIFIED Requirements

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

## MODIFIED Requirements

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
