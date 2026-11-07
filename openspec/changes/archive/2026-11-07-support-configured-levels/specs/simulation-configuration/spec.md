## MODIFIED Requirements

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
