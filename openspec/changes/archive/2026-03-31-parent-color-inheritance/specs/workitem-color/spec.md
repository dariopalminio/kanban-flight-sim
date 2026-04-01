## ADDED Requirements

### Requirement: Workitem color field
Every `Workitem` SHALL carry a `color: string` field containing a CSS color value. The field SHALL be assigned at creation time and SHALL NOT change after the item is created.

#### Scenario: L3 item has a color on creation
- **WHEN** an L3 workitem is created (via `buildInitialState` or demand injection)
- **THEN** the workitem has a non-empty `color` string

#### Scenario: Child item inherits parent color
- **WHEN** a child workitem (L0, L1, or L2) is spawned from a parent
- **THEN** the child's `color` equals the parent's `color`

---

### Requirement: L3 color palette assignment
L3 workitems SHALL receive colors from a fixed palette of at least 8 distinct colors, assigned cyclically based on the L3 creation counter (0-based index). The palette SHALL provide visually distinguishable colors suitable for display on a dark background.

The palette SHALL be (in order):

| Index | Color | Hex |
|---|---|---|
| 0 | Rojo | `#e74c3c` |
| 1 | Naranja | `#e67e22` |
| 2 | Amarillo | `#f1c40f` |
| 3 | Verde | `#2ecc71` |
| 4 | Teal | `#1abc9c` |
| 5 | Azul | `#3498db` |
| 6 | Violeta | `#9b59b6` |
| 7 | Rosa | `#e91e63` |
| 8 | Cyan | `#00bcd4` |
| 9 | Ámbar | `#ff9800` |

#### Scenario: First L3 item receives palette index 0
- **WHEN** the first L3 workitem is created (counter index 0)
- **THEN** its `color` is `#e74c3c`

#### Scenario: Colors cycle after palette exhaustion
- **WHEN** more L3 items are created than there are palette entries
- **THEN** colors wrap around: item at index N receives `PALETTE[N % PALETTE.length]`

#### Scenario: Initial L3 items assigned in creation order
- **WHEN** `buildInitialState` creates multiple L3 items (initialReleaseCount > 1)
- **THEN** each item receives the palette color corresponding to its 0-based position in the initial array

#### Scenario: Demand-injected L3 item assigned by cumulative counter
- **WHEN** a new L3 item is injected via demand (Step 8)
- **THEN** its color is `PALETTE[(L3Counter - 1) % PALETTE.length]` where `L3Counter` is the updated counter after calling `nextId`
