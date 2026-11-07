## ADDED Requirements

### Requirement: SimulationSelector component renders simulation dropdown
The system SHALL provide a `SimulationSelector` React component at `src/components/SimulationSelector.tsx` that renders a labeled dropdown (`<select>`) listing all available simulation names.

#### Scenario: Renders with current simulation selected
- **WHEN** `SimulationSelector` is rendered with `selectedSim="Simplified"` and `simulationNames=["Simplified", "SDF workflows"]`
- **THEN** the select element SHALL show "Simplified" as the selected option

#### Scenario: Calls onSimChange when simulation is changed
- **WHEN** the user selects a different simulation from the dropdown
- **THEN** the `onSimChange` callback SHALL be called with the new simulation name

### Requirement: SimulationSelector component renders board view mode dropdown
The component SHALL render the labeled view dropdown from active-level availability. It SHALL capitalize Portafolio, Delivery and Full labels and preserve existing L3/L2/L1 labels. Options with no active target boards SHALL be absent. Its selected value SHALL be an available mode, with unavailable selections normalized to Full by the application.

#### Scenario: Renders with current view mode selected
- **WHEN** Delivery is available and `viewMode` is `delivery`
- **THEN** Delivery SHALL be selected

#### Scenario: Calls onViewModeChange when view mode is changed
- **WHEN** the user selects an available view mode
- **THEN** `onViewModeChange` SHALL receive that `ViewMode` value

#### Scenario: Partial model exposes only available options
- **WHEN** active levels are L2 and L1
- **THEN** the dropdown SHALL contain Portafolio, Delivery, Full, L2 and L1, and SHALL NOT contain L3

### Requirement: SimulationSelector applies consistent toolbar styling
The component SHALL apply inline styles matching the existing toolbar appearance: background `#0f172a` for the simulation select, `#1e293b` for the view mode select, text color `white`, border `1px solid #475569`, border-radius `4px`, font-size `11px`, font-weight `600`.

#### Scenario: Styles are applied via inline style props
- **WHEN** the component is rendered
- **THEN** both select elements SHALL have inline style props (no CSS classes)
