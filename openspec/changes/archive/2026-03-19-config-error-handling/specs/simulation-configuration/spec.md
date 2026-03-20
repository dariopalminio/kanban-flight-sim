## MODIFIED Requirements

### Requirement: Default simulation loaded on startup
When the application initializes, it SHALL attempt to load the simulation named by `defaultSimulation`. If that name does not match any simulation in the `simulations` array, the application MUST fall back to the first available simulation and MUST NOT throw an unhandled exception or render a blank page.

#### Scenario: Default simulation loaded on startup — name matches
- **WHEN** the application initializes and `defaultSimulation` matches a simulation in the array
- **THEN** that simulation is loaded and active

#### Scenario: Default simulation not found — fallback applied
- **WHEN** the application initializes and `defaultSimulation` does not match any simulation in the array
- **THEN** the first simulation in the `simulations` array is loaded, and a warning is surfaced to the UI via `configLoadResult.error`
