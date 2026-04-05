## ADDED Requirements

### Requirement: SimulationControls component renders playback buttons
The system SHALL provide a `SimulationControls` React component at `src/components/SimulationControls.tsx` that renders: Step, Autoplay/Pause, Reset, Slower, and Faster buttons. Each button SHALL display a `lucide-react` icon alongside its text label.

#### Scenario: Step button calls onStep
- **WHEN** the user clicks the "Step" button
- **THEN** the `onStep` callback SHALL be called

#### Scenario: Step button is disabled during autoplay
- **WHEN** `isPlaying` is `true`
- **THEN** the "Step" button SHALL be rendered as `disabled`

#### Scenario: Autoplay button toggles label and icon
- **WHEN** `isPlaying` is `false`
- **THEN** the toggle button SHALL display "Autoplay" with a Play icon
- **WHEN** `isPlaying` is `true`
- **THEN** the toggle button SHALL display "Pause" with a Pause icon

#### Scenario: Autoplay button calls onTogglePlay
- **WHEN** the user clicks the Autoplay/Pause button
- **THEN** the `onTogglePlay` callback SHALL be called

#### Scenario: Reset button calls onReset
- **WHEN** the user clicks the "Reset" button
- **THEN** the `onReset` callback SHALL be called

#### Scenario: Slower button is disabled at max interval
- **WHEN** `canSlower` is `false`
- **THEN** the "Slower" button SHALL be rendered as `disabled`

#### Scenario: Faster button is disabled at min interval
- **WHEN** `canFaster` is `false`
- **THEN** the "Faster" button SHALL be rendered as `disabled`

#### Scenario: Each button renders its assigned icon
- **THEN** the "Step" button SHALL display a `ChevronRight` icon
- **THEN** the "Reset" button SHALL display a `RotateCcw` icon
- **THEN** the "Slower" button SHALL display a `ChevronsLeft` icon
- **THEN** the "Faster" button SHALL display a `ChevronsRight` icon

### Requirement: SimulationControls displays tick and interval info
The component SHALL render two read-only labels: one showing the current tick count (`Tick: <n>`) and one showing the current autoplay interval in milliseconds (`Tick ms: <n>`).

#### Scenario: Tick counter reflects current tick
- **WHEN** `tickCount` is `42`
- **THEN** the component SHALL display the text "Tick: 42"

#### Scenario: Interval label reflects current interval
- **WHEN** `autoplayIntervalMs` is `500`
- **THEN** the component SHALL display the text "Tick ms: 500"

### Requirement: SimulationControls applies active style to Autoplay when playing
The component SHALL visually distinguish the Autoplay/Pause button when autoplay is active using a highlighted style (background `#334155`, border-color `#94a3b8`).

#### Scenario: Active style applied when playing
- **WHEN** `isPlaying` is `true`
- **THEN** the Autoplay/Pause button SHALL have the active button inline style (background `#334155`)
