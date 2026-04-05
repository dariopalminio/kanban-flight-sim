## ADDED Requirements

### Requirement: KanbanSignalSelector component renders four mutually-exclusive toggle buttons
The system SHALL provide a `KanbanSignalSelector` React component at `src/components/KanbanSignalSelector.tsx` that renders four toggle buttons: "Upstream / Downstream" (`stream`), "Status Category" (`category`), "Before Commitment Point" (`commitment`), and "Pos Delivery Point" (`delivery`).

#### Scenario: All four buttons are rendered
- **WHEN** `KanbanSignalSelector` is rendered with any `highlightMode`
- **THEN** all four buttons SHALL be present in the output

#### Scenario: Active button reflects current highlight mode
- **WHEN** `highlightMode` is `"stream"`
- **THEN** the "Upstream / Downstream" button SHALL render with the active style (background `#334155`, border-color `#94a3b8`)
- **AND** all other buttons SHALL render with the default style (background `#1e293b`, border-color `#475569`)

### Requirement: KanbanSignalSelector toggles highlight mode on click
Clicking an active button SHALL deactivate it (returning to `"none"`). Clicking an inactive button SHALL activate it. The component is mutually exclusive — only one button can be active at a time.

#### Scenario: Clicking inactive button activates it
- **WHEN** `highlightMode` is `"none"` and the user clicks "Status Category"
- **THEN** the `onToggle` callback SHALL be called with `"category"`

#### Scenario: Clicking active button deactivates it
- **WHEN** `highlightMode` is `"category"` and the user clicks "Status Category"
- **THEN** the `onToggle` callback SHALL be called with `"category"` (App.tsx handles the toggle-off logic)

### Requirement: KanbanSignalSelector applies consistent toolbar button styling
All buttons SHALL use inline styles with base style (background `#1e293b`, border `1px solid #475569`, border-radius `4px`, font-size `11px`, font-weight `600`, color `white`) and active style (background `#334155`, border-color `#94a3b8`).

#### Scenario: Styles applied via inline style props
- **WHEN** the component is rendered
- **THEN** each button SHALL have inline style props (no CSS classes)
