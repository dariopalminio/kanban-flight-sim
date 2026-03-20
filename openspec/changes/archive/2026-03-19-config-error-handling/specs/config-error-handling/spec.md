## ADDED Requirements

### Requirement: Fallback when defaultSimulation not found
When `defaultConfig.json` contains a `defaultSimulation` value that does not match any entry in the `simulations` array, the application SHALL NOT throw an unhandled exception. Instead, it MUST silently fall back to the first simulation in the array and expose an error message string for UI display.

#### Scenario: defaultSimulation name does not match any simulation
- **WHEN** `defaultSimulation` is `"Simplified"` but no simulation with that name exists in the `simulations` array
- **THEN** the app loads using the first available simulation, and `configLoadResult.error` contains a human-readable message such as `Simulation "Simplified" not found; using "<first name>" as fallback.`

#### Scenario: defaultSimulation matches a valid simulation
- **WHEN** `defaultSimulation` matches exactly one simulation in the `simulations` array
- **THEN** that simulation is loaded and `configLoadResult.error` is `undefined`

#### Scenario: simulations array is empty
- **WHEN** the `simulations` array is empty
- **THEN** the application MUST NOT render a blank page; a readable error message SHALL be shown to the user via the ErrorBoundary

---

### Requirement: ErrorBoundary prevents blank page
The application SHALL wrap its root component tree in a React `ErrorBoundary`. If any unhandled render error occurs (including those caused by invalid configuration), the ErrorBoundary MUST display a visible, user-readable error message instead of leaving the page blank.

#### Scenario: Unhandled render error caught by ErrorBoundary
- **WHEN** any component in the tree throws during render
- **THEN** the ErrorBoundary renders a fallback UI with a descriptive error message; the page SHALL NOT be blank

#### Scenario: Normal operation — ErrorBoundary is transparent
- **WHEN** no render error occurs
- **THEN** the application renders normally with no visual change

---

### Requirement: Config error warning banner
When the app loads with a fallback simulation (due to `configLoadResult.error` being set), the UI SHALL display a visible warning banner above the boards informing the user that the default simulation was not found and which simulation is being used instead.

#### Scenario: Warning banner shown on fallback
- **WHEN** `configLoadResult.error` is a non-empty string
- **THEN** a warning banner is rendered at the top of the app content with the error message text, styled with inline CSS (yellow/amber background), before the simulation boards

#### Scenario: No banner on clean load
- **WHEN** `configLoadResult.error` is `undefined`
- **THEN** no warning banner is rendered
