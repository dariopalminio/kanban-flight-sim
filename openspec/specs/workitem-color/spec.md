## ADDED Requirements

### Requirement: Workitem color field
Every `Workitem` SHALL carry a `color: string` field containing a CSS color value. The field SHALL be assigned at creation time and SHALL NOT change after the item is created.

#### Scenario: L3 item has a color on creation
- **WHEN** an L3 workitem is created (via `buildInitialState` or demand injection)
- **THEN** the workitem has a non-empty `color` string

#### Scenario: L1 and L0 items inherit their parent's color
- **WHEN** an L1 or L0 workitem is spawned from a parent
- **THEN** the child's `color` equals the parent's `color`, so every L1 and L0 item shows the color of its L2 ancestor

---

### Requirement: L2 own color assignment
L2 workitems SHALL NOT inherit the color of their L3 parent. Each L2 workitem SHALL receive its own color from the same palette, assigned cyclically based on the L2 creation counter over the palette entries that differ from the parent's color.

#### Scenario: L2 item never matches its parent
- **WHEN** an L2 workitem is spawned from an L3 parent
- **THEN** its `color` is a palette color different from the parent's `color`

#### Scenario: Sibling L2 items get different colors
- **WHEN** an L3 parent spawns up to `PALETTE.length - 1` L2 children
- **THEN** each child has a different `color`

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

---

### Requirement: Parentless roots below L3 use the existing palette
Parentless root workitems at L2, L1 or L0 SHALL receive colors from the same runtime palette used for root L3, cyclically using their own level counter. Initialization and Step 8 injection SHALL share this assignment. Colors SHALL remain unchanged after creation. Existing L2 own-color behavior when spawned from L3 in Step 7 and L1/L0 inheritance in Steps 5/3 SHALL remain unchanged.

#### Scenario: First L2 root uses the current first palette entry
- **WHEN** a model with root L2 creates its first initial root item
- **THEN** its color SHALL be `#0972b8`, the existing runtime palette's first entry

#### Scenario: Injected root uses its cumulative counter
- **WHEN** Step 8 creates root item number N
- **THEN** its color SHALL equal the runtime palette entry at `(N - 1) % palette.length`

#### Scenario: L1 child inherits L2 root color
- **WHEN** Step 5 spawns an L1 child from a parentless L2 root
- **THEN** the child SHALL inherit that root's color

#### Scenario: Full-model color rules are preserved
- **WHEN** all four levels are active
- **THEN** Step 7 SHALL assign L2 colors different from their L3 parent and Steps 5/3 SHALL preserve parent-color inheritance
