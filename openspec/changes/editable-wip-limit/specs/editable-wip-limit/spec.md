## ADDED Requirements

### Requirement: WIP limit override state in App
`App` SHALL maintain a `wipLimitOverrides: Record<string, number>` state (keyed by `status.id`). This map SHALL be merged into `effectiveConfig` so that any status whose `id` is present in the map uses the overridden value as its `wipLimit` instead of the config-defined value. Columns whose `status.wipLimit` is `undefined` in the config SHALL NOT be overrideable; no entry for them is ever added to the map.

#### Scenario: Override is reflected in the next tick
- **WHEN** the user changes the WIP limit of a column with `statusId` "in-progress" to `3`
- **THEN** `effectiveConfig` passes `wipLimit: 3` for that status to the engine on the next `tick()` call

#### Scenario: Override does not affect columns without a configured wipLimit
- **WHEN** a status has no `wipLimit` defined in `defaultConfig.json`
- **THEN** `wipLimitOverrides` MUST NOT contain an entry for that status id, and the column renders no editable input

---

### Requirement: Overrides reset on simulation change or reset
`App` SHALL reset `wipLimitOverrides` to an empty object whenever `handleSimChange` or `handleReset` is called.

#### Scenario: Selecting a different simulation clears overrides
- **WHEN** the user selects a different simulation from the selector while overrides exist
- **THEN** `wipLimitOverrides` becomes `{}` and all columns display their config-defined WIP limits

#### Scenario: Clicking Reset clears overrides
- **WHEN** the user clicks the Reset button
- **THEN** `wipLimitOverrides` becomes `{}` and all columns display their config-defined WIP limits

---

### Requirement: onWipLimitChange callback prop threading
`App` SHALL pass an `onWipLimitChange: (statusId: string, value: number) => void` callback to `Board`. `Board` SHALL forward this callback to each `Column`. `Column` SHALL invoke this callback when the user commits a new WIP limit value.

#### Scenario: Callback reaches Column through Board
- **WHEN** `App` renders a `Board` with `onWipLimitChange`
- **THEN** each `Column` rendered by that `Board` receives the same callback reference

---

### Requirement: Inline editable WIP limit input in column header
For any column whose `status.wipLimit` is not `null`/`undefined`, the WIP limit display in the column header SHALL be rendered as an `<input type="number">` element instead of a static number. The input SHALL:
- Display the current effective WIP limit as its value.
- Have `min="1"` to prevent zero or negative limits.
- Use local draft state so that in-progress edits are not lost during autoplay re-renders.
- Commit the new value to `onWipLimitChange` on `blur` or on `Enter` key press.
- Discard the draft (revert to effective WIP limit) on `Escape` key press.
- Be styled inline to fit the compact column header (small font size matching the header, dark background, minimal border).

#### Scenario: Input displays current effective WIP limit
- **WHEN** a column has `wipLimit: 2` (from config or override) and no pending draft
- **THEN** the header input shows the value `2`

#### Scenario: Typing a new value does not immediately fire the callback
- **WHEN** the user types `4` in the WIP limit input
- **THEN** the draft state updates locally but `onWipLimitChange` is NOT called until blur or Enter

#### Scenario: Blur commits the new value
- **WHEN** the user types `4` and then clicks outside the input (blur)
- **THEN** `onWipLimitChange` is called with the column's `statusId` and `4`

#### Scenario: Enter key commits the new value
- **WHEN** the user types `5` and presses Enter
- **THEN** `onWipLimitChange` is called with the column's `statusId` and `5`

#### Scenario: Escape reverts to effective WIP limit
- **WHEN** the user types `7` and presses Escape
- **THEN** `onWipLimitChange` is NOT called and the input reverts to the previous effective WIP limit

#### Scenario: Columns without wipLimit show no input
- **WHEN** a status has no `wipLimit` in the config
- **THEN** the column header renders no `<input>` element for WIP limit editing
