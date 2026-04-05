## Requirements

### Requirement: Without L0 toggle in SimulationSelector
The system SHALL provide a toggle button in `SimulationSelector` labeled "With L0" (default) / "Without L0" (active state) that enables or disables the L0 level.

#### Scenario: Toggle displays "With L0" by default
- **WHEN** the application first renders
- **THEN** the toggle SHALL display "With L0" in the default (inactive) style

#### Scenario: Toggle switches to "Without L0" on click
- **WHEN** the user clicks the toggle while `withoutL0` is false
- **THEN** the toggle SHALL display "Without L0" in the active (highlighted) style

#### Scenario: Toggling resets the simulation
- **WHEN** the user clicks the Without L0 toggle
- **THEN** the simulation SHALL reset to tick 0 with no workitems

### Requirement: L0 is not processed by the engine when withoutL0 is true
When `config.withoutL0` is `true`, the `tick()` engine function SHALL skip all L0-related processing.

#### Scenario: No L0 items are ever created
- **WHEN** `config.withoutL0` is `true` and the simulation runs for multiple ticks
- **THEN** no workitems with `level === "L0"` SHALL exist in the simulation state

#### Scenario: L1 items do not spawn L0 children at commitment point
- **WHEN** `config.withoutL0` is `true` and an L1 item reaches its commitment point status
- **THEN** no L0 children SHALL be spawned for that L1 item

### Requirement: L1 advances autonomously when withoutL0 is true
When `config.withoutL0` is `true`, L1 workitems SHALL advance probabilistically through all statuses — including `firstDownstream` and `secondDownstream` — without being blocked by or dependent on L0 children.

#### Scenario: L1 advances through firstDownstream without L0 dependency
- **WHEN** `config.withoutL0` is `true` and an L1 item is at its `firstDownstreamOrder` status
- **THEN** the item SHALL be eligible to advance probabilistically to the next status (no L0 blocking)

#### Scenario: L1 advances through secondDownstream without L0 dependency
- **WHEN** `config.withoutL0` is `true` and an L1 item is at its `secondDownstreamOrder` status
- **THEN** the item SHALL be eligible to advance probabilistically to the next status (no L0 blocking)

### Requirement: withoutL0 field is optional in Config
The `Config` type SHALL include an optional field `withoutL0?: boolean`. When absent or `false`, engine behavior is unchanged.

#### Scenario: Default behavior preserved when withoutL0 is false
- **WHEN** `config.withoutL0` is `false` or undefined
- **THEN** the engine SHALL behave identically to the pre-change behavior (Steps 1–3 execute normally)
