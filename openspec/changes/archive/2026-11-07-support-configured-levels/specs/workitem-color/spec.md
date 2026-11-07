## ADDED Requirements

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
