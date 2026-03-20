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
Each column header SHALL display the status name. If the status has a `wipLimit`, the header SHALL show `<name> [<current>/<limit>]` (e.g., `In-Progress [1/1]`). If `isBeforeCommitmentPoint` is true the column name text SHALL be underlined. If `isBuffer` is true, the header SHALL additionally show a `✓` indicator in green (`#22c55e`) after the name (and after the WIP display if present).

#### Scenario: WIP limit column shows current and max counts
- **WHEN** a column with `wipLimit: 1` contains 1 item
- **THEN** the header displays `In-Progress [1/1]`

#### Scenario: Commitment-point column name is underlined
- **WHEN** a status has `isBeforeCommitmentPoint: true`
- **THEN** the column header text has `text-decoration: underline`

#### Scenario: Buffer column header shows ✓ after name
- **WHEN** a status has `isBuffer: true`
- **THEN** the column header shows the status name followed by a green `✓` symbol

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
Each card SHALL display the workitem's `id` string centered on a colored background. The color is level-specific:

| Level | Card background color |
|---|---|
| L3 | `#7c3aed` (violet) |
| L2 | `#1d4ed8` (blue) |
| L1 | `#ea580c` (orange) |
| L0 | `#16a34a` (green) |

#### Scenario: L0 card displays green background with item ID
- **WHEN** an L0 workitem `SUBT-1pSTOR-1` is rendered
- **THEN** a green card with text `SUBT-1pSTOR-1` appears in the correct column

---

### Requirement: Real-time board updates after each tick
After each tick (manual or autoplay), all boards SHALL re-render with the updated workitem positions without a page reload.

#### Scenario: Card moves to next column after tick
- **WHEN** a tick advances an L0 item from status A to status B
- **THEN** the card appears in column B and not in column A in the next render
