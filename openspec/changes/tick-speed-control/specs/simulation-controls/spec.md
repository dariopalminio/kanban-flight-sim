## MODIFIED Requirements

### Requirement: Autoplay runs simulation continuously at configurable tick interval
Clicking **Autoplay** SHALL start an interval that calls `tick` repeatedly using the current user-selected tick interval in milliseconds. The default interval MUST be 1000 ms on initial load and after reset of simulation state. Clicking the same control again SHALL stop the interval. The button label SHALL change between `Autoplay` (idle) and `Pause` (playing). Autoplay SHALL remain implemented via `setInterval` driven by React `useEffect`.

#### Scenario: Autoplay advances tick at default interval
- **WHEN** the user activates Autoplay without changing speed controls
- **THEN** the tick counter increments approximately once every 1000 ms

#### Scenario: Pause stops autoplay
- **WHEN** Autoplay is active and the user clicks Pause
- **THEN** the interval is cleared and the simulation stops advancing

#### Scenario: Interval updates after speed adjustment
- **WHEN** Autoplay is active and the user changes the tick interval
- **THEN** subsequent autoplay ticks run using the updated interval value

## ADDED Requirements

### Requirement: User can adjust autoplay tick speed from header controls
The header SHALL provide controls to make autoplay faster or slower by changing tick interval milliseconds in fixed increments. The UI SHALL display the current interval as `Tick ms: <n>`. Interval updates SHALL be clamped to configured minimum and maximum bounds.

#### Scenario: Slower control increases interval
- **WHEN** the user clicks the slower control
- **THEN** the displayed `Tick ms` value increases by one step, without exceeding maximum bound

#### Scenario: Faster control decreases interval
- **WHEN** the user clicks the faster control
- **THEN** the displayed `Tick ms` value decreases by one step, without going below minimum bound

#### Scenario: Interval display reflects current value
- **WHEN** the user adjusts speed controls one or more times
- **THEN** the header always shows the latest active `Tick ms` value used by autoplay
