## ADDED Requirements

### Requirement: Step button advances simulation one tick
Clicking the **Step** button SHALL call `tick(state, config)` once and update the displayed simulation state. The Step button SHALL be disabled when Autoplay is running.

#### Scenario: Step advances tick counter by 1
- **WHEN** the user clicks Step
- **THEN** the tick counter displayed in the header increases by 1

#### Scenario: Step is disabled during Autoplay
- **WHEN** Autoplay is active
- **THEN** the Step button is in a disabled state and cannot be clicked

---

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

---

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

---

### Requirement: Reset restores initial simulation state
Clicking **Reset** SHALL rebuild the initial state via `buildInitialState(config)` and stop Autoplay if running.

#### Scenario: Reset clears all non-L3 workitems
- **WHEN** the simulation has progressed and the user clicks Reset
- **THEN** only the initial L3 workitems remain and tick counter is 0

#### Scenario: Reset stops Autoplay
- **WHEN** Autoplay is running and the user clicks Reset
- **THEN** Autoplay stops

---

### Requirement: Simulation selector dropdown
The header SHALL include a `<select>` dropdown listing all simulations from `simulationNames`. Selecting a different simulation SHALL load its configuration, reset to initial state, and stop Autoplay.

#### Scenario: All simulations appear in dropdown
- **WHEN** the application loads
- **THEN** the dropdown contains one option per entry in `defaultConfig.json`'s `simulations` array

#### Scenario: Switching simulation resets state
- **WHEN** the user selects a different simulation from the dropdown
- **THEN** tick counter resets to 0, boards update to the new workflows, and Autoplay is stopped

---

### Requirement: Mutually exclusive view-highlight toggles
Four toggle buttons control the `HighlightMode`: **Upstream / Downstream**, **Status Category**, **Commitment Status**, and **Delivery Status**. These are mutually exclusive — activating one SHALL deactivate any previously active one. A second click on the active button SHALL return to `none` mode.

| Button | Mode activated |
|---|---|
| Upstream / Downstream | `stream` |
| Status Category | `category` |
| Commitment Status | `commitment` |
| Delivery Status | `delivery` |

#### Scenario: Activating one highlight deactivates the previous
- **WHEN** Status Category is active and the user clicks Upstream / Downstream
- **THEN** Upstream / Downstream becomes active and Status Category is deactivated

#### Scenario: Clicking active toggle returns to no highlight
- **WHEN** Commitment Status is active and the user clicks it again
- **THEN** highlight mode returns to `none` and all columns revert to their default appearance

#### Scenario: Active button shows visual active state
- **WHEN** a toggle is in its active state
- **THEN** the button renders with `BTN_ACTIVE_STYLE` (darker background, lighter border) instead of `BTN_STYLE`

---

### Requirement: Tick counter display
The header SHALL display the current tick count as `Tick: <n>`.

#### Scenario: Tick counter starts at 0
- **WHEN** the application loads or is reset
- **THEN** the header shows `Tick: 0`
