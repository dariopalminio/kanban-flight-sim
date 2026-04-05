## MODIFIED Requirements

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
- **THEN** the toggle button SHALL display a `Play` icon and the label "Autoplay"
- **WHEN** `isPlaying` is `true`
- **THEN** the toggle button SHALL display a `Pause` icon and the label "Pause"

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
- **WHEN** `SimulationControls` is rendered
- **THEN** the Step button SHALL contain a `ChevronRight` icon
- **AND** the Reset button SHALL contain a `RotateCcw` icon
- **AND** the Slower button SHALL contain a `ChevronsLeft` icon
- **AND** the Faster button SHALL contain a `ChevronsRight` icon
