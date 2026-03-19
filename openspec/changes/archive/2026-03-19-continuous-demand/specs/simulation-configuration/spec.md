## MODIFIED Requirements

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
