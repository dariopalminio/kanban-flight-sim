## ADDED Requirements

### Requirement: Four vertically-stacked boards
The UI SHALL render up to four Kanban boards stacked vertically in hierarchical order: L3 at top, L2, L1, L0 at bottom. Which boards are visible at any time SHALL be determined by the active view mode. All visible boards SHALL be rendered without horizontal scrolling.

#### Scenario: Boards rendered in L3→L0 order when all are visible
- **WHEN** the application renders boards from the visible set
- **THEN** boards appear top-to-bottom in descending level order (higher level number = higher position)

#### Scenario: Only L3 and L2 rendered in Portafolio mode
- **WHEN** the active view mode is "Portafolio"
- **THEN** exactly two boards are rendered: L3 at top, L2 below it

#### Scenario: Only L2, L1, L0 rendered in Delivery mode
- **WHEN** the active view mode is "Delivery"
- **THEN** exactly three boards are rendered: L2 at top, L1 in the middle, L0 at the bottom

---

### Requirement: Board header with level and workflow name
Each board SHALL display a colored header tab showing `<level> — <workflowName>` (e.g., `L2 — Epic`). The header color is level-specific:

| Level | Header background color |
|---|---|
| L3 | `#4c1d95` (deep violet) |
| L2 | `#04288b` (deep blue) |
| L1 | `#ad4208` (deep orange) |
| L0 | `#2e4e3a` (deep green) |

#### Scenario: L3 board header shows correct label and color
- **WHEN** the "Simplified" simulation is active
- **THEN** the top board's header reads `L3 — Project` with a violet background

---

### Requirement: Columns per workflow status
Each board SHALL render one column per status in its workflow, in `order` sequence (left to right). Columns use CSS flex-wrap so that narrow viewports wrap columns without horizontal scrolling.

#### Scenario: Column count matches workflow status count
- **WHEN** the "Simplified" simulation is active
- **THEN** each board renders exactly 4 columns

---

### Requirement: Column header with name and optional WIP display
Each column header SHALL display the status name. If the status has a `wipLimit`, the header SHALL show `<name> [<current>/<limit>]` (e.g., `In-Progress [1/1]`). If `isBeforeCommitmentPoint` is true the column name text SHALL be underlined. If `isBuffer` is true, the header SHALL additionally show a `✓` indicator in green (`#22c55e`) after the name (and after the WIP display if present). If the status has a non-empty `description`, the header container element SHALL include a `title` attribute set to that description; if the description is absent or empty the `title` attribute SHALL be omitted.

#### Scenario: WIP limit column shows current and max counts
- **WHEN** a column with `wipLimit: 1` contains 1 item
- **THEN** the header displays `In-Progress [1/1]`

#### Scenario: Commitment-point column name is underlined
- **WHEN** a status has `isBeforeCommitmentPoint: true`
- **THEN** the column header text has `text-decoration: underline`

#### Scenario: Buffer column header shows ✓ after name
- **WHEN** a status has `isBuffer: true`
- **THEN** the column header shows the status name followed by a green `✓` symbol

#### Scenario: Column header tooltip shows description on hover
- **WHEN** a status has a non-empty `description` field in the configuration
- **THEN** the column header element has a `title` attribute equal to that description

#### Scenario: No tooltip when description is absent or empty
- **WHEN** a status has no `description` field or its value is an empty string
- **THEN** the column header element has no `title` attribute set

---

### Requirement: Column highlight modes
Columns SHALL change background and/or border based on the active `HighlightMode`:

| Mode | Upstream columns | Downstream (non-delivery) | Delivery column |
|---|---|---|---|
| `none` | `#1e293b` | `#1e293b` | `#1e293b` |
| `stream` | `#1e3a8a` (blue) | `#065f46` (green) | `#065f46` (green) |
| `category` | `#374151` (TODO=gray) | `#1d4ed8` (IN_PROGRESS=blue) | `#166534` (DONE=green) |
| `commitment` | `#1e293b` | `#1e293b` | `#1e293b` |
| `delivery` | `#1e293b` | `#1e293b` | `#14532d` (dark green) |

Additionally, in `delivery` mode the delivery column SHALL have a `1px solid #4ade80` border instead of the default `1px solid #334155`. In `commitment` mode the commitment-point column SHALL have background `#ddb121`.

#### Scenario: Stream mode highlights upstream columns in blue
- **WHEN** highlight mode is `stream`
- **THEN** all upstream columns show background `#1e3a8a`

---

### Requirement: Cards display workitem ID with level color
Each card SHALL display the workitem's `id` string centered on a colored background. The background color SHALL be `item.color` (the workitem's lineage color), not a fixed level-based color. The `LEVEL_COLORS` map in `Card.tsx` SHALL be removed.

#### Scenario: L3 card uses item.color as background
- **WHEN** an L3 workitem with `color: "#3498db"` is rendered
- **THEN** the card background is `#3498db`

#### Scenario: L0 child card uses same color as its L3 ancestor
- **WHEN** an L0 workitem inherits color `#2ecc71` from its ancestor chain
- **THEN** the card background is `#2ecc71`, not the previous fixed L0 color `#ea580c`

#### Scenario: Two sibling items share the same card color
- **WHEN** two L1 items share the same L3 ancestor
- **THEN** both cards display the same background color

---

### Requirement: Real-time board updates after each tick
After each tick (manual or autoplay), all boards SHALL re-render with the updated workitem positions without a page reload.

#### Scenario: Card moves to next column after tick
- **WHEN** a tick advances an L0 item from status A to status B
- **THEN** the card appears in column B and not in column A in the next render

---

### Requirement: FIFO card display order within columns
Cards within each column SHALL be rendered sorted by `enteredAt` ascending (oldest entry at top, newest at bottom). The sort SHALL be stable: items with equal `enteredAt` values retain their relative order from the source array. Items newly arrived in a column (highest `enteredAt`) SHALL appear at the bottom of the column.

#### Scenario: Oldest item appears at top of column
- **WHEN** a column contains items with different `enteredAt` values
- **THEN** the item with the lowest `enteredAt` is rendered first (topmost) in the column

#### Scenario: Newly arrived item appears at bottom of column
- **WHEN** a workitem transitions into a column in the current tick
- **THEN** that item renders at the bottom of the column (after all items with a lower `enteredAt`)

#### Scenario: Stable sort for equal enteredAt
- **WHEN** two or more items in the same column share the same `enteredAt` value
- **THEN** their relative render order matches their relative order in the source workitems array

---

### Requirement: currentTick prop threading through board components
The `Board`, `Column`, and `Card` components SHALL each accept a `currentTick: number` prop. `App` SHALL pass `simState.tick` as `currentTick` to each `<Board>`. `Board` SHALL pass it to each `<Column>`. `Column` SHALL pass it to each `<Card>`. This prop is used exclusively for the tick-flash-highlight feature.

#### Scenario: currentTick flows from App to Card
- **WHEN** `App` renders `<Board currentTick={simState.tick} ...>`
- **THEN** each `Card` rendered within that Board receives `currentTick` equal to `simState.tick`

#### Scenario: currentTick updates after every tick
- **WHEN** a tick executes and `simState.tick` increments by 1
- **THEN** all `Card` components receive the updated `currentTick` value in the same render cycle

