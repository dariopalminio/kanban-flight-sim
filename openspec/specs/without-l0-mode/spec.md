## Requirements

### Requirement: Without L0 toggle in SimulationSelector
The system SHALL offer the With L0 / Without L0 toggle only when L0 and at least one higher workflow are configured. Its default applicable state SHALL be With L0. Toggling SHALL rebuild initial state at tick 0 from the effective hierarchy, stop autoplay and retain the existing autoplay-speed reset behavior. The toggle SHALL NOT disable a sole L0 model or appear on models without L0.

#### Scenario: Toggle displays "With L0" by default
- **WHEN** a model with L0 and higher workflows first renders
- **THEN** the toggle SHALL display With L0 in inactive style

#### Scenario: Toggle switches to "Without L0" on click
- **WHEN** an applicable toggle is clicked while `withoutL0` is false
- **THEN** it SHALL display Without L0 in active style and disable L0 processing/rendering

#### Scenario: Toggling resets the simulation
- **WHEN** the applicable toggle is clicked
- **THEN** the simulation SHALL return to tick 0 with `initialReleaseCount` items at its highest active level and autoplay stopped

#### Scenario: Toggle is absent from the two-level SDDF model
- **WHEN** only L2 and L1 are configured
- **THEN** the toggle SHALL be absent and L1 SHALL advance autonomously in Step 3 without requiring user action

#### Scenario: Sole L0 cannot be disabled
- **WHEN** only L0 is configured
- **THEN** the toggle SHALL be absent and L0 SHALL remain active

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

#### Scenario: L1 start is held back by the pull rule
- **WHEN** `config.withoutL0` is `true`, an L1 item would enter its `secondDownstreamOrder` status, and an ancestor that is not yet in construction has no capacity to enter
- **THEN** the item SHALL stay at its `firstDownstreamOrder` status, as defined by the pull rule in `trigger-up-rules`

### Requirement: withoutL0 field is optional in Config
`Config` SHALL retain optional `withoutL0?: boolean`. Absent or false SHALL activate every configured workflow, without requiring missing L0. True SHALL remove configured L0 from the effective hierarchy; an empty effective hierarchy SHALL be rejected explicitly. On model change, the application SHALL preserve this preference only if the new model offers the toggle, and SHALL otherwise clear it before initialization.

#### Scenario: Default behavior preserved when withoutL0 is false
- **WHEN** a full four-level model has `withoutL0` absent or false
- **THEN** Steps 1-3 SHALL execute normally as before

#### Scenario: Missing L0 is valid without the flag
- **WHEN** only L2 and L1 are configured and `withoutL0` is absent
- **THEN** Step 3 SHALL advance L1 autonomously and SHALL NOT access L0

#### Scenario: Stale preference is cleared on model switch
- **WHEN** Without L0 is enabled and the user switches to a sole L0 model
- **THEN** the application SHALL clear the preference before initializing active L0 work

#### Scenario: Applicable preference is retained
- **WHEN** Without L0 is enabled and the user switches to another model with L0 and higher levels
- **THEN** L0 SHALL remain disabled and initialization SHALL use that model's effective hierarchy

#### Scenario: Engine rejects an explicitly empty active hierarchy
- **WHEN** a direct configuration contains only L0 with `withoutL0` true
- **THEN** initialization/tick SHALL report an empty-active-hierarchy error rather than fabricate a simulation
