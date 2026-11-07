## MODIFIED Requirements

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
