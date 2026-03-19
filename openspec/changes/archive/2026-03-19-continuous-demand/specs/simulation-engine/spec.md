## MODIFIED Requirements

### Requirement: Seven ordered steps per tick
Every tick SHALL execute exactly 7 steps in fixed order. Each step receives the item array produced by the previous step:

1. **Step 1** — Advance L0 items autonomously
2. **Step 2** — Push L1 items to first-downstream when any L0 child has entered downstream
3. **Step 3** — Advance L1 items with hierarchical rules (may spawn L0 children)
4. **Step 4** — Push L2 items to first-downstream when any L1 child has entered downstream
5. **Step 5** — Advance L2 items with hierarchical rules (may spawn L1 children)
6. **Step 6** — Push L3 items to first-downstream when any L2 child has entered downstream
7. **Step 7** — Advance L3 items with hierarchical rules (may spawn L2 children)
8. **Step 8** — Inject new L3 demand item if `demandInterval > 0` and `currentTick % demandInterval === 0`

#### Scenario: L0 advances before L1 is evaluated
- **WHEN** a tick executes
- **THEN** Step 1 completes (L0 positions updated) before Step 2 uses those positions to evaluate L1 push

#### Scenario: L2 push uses positions after L1 advancement
- **WHEN** a tick executes
- **THEN** Step 4 sees the L1 positions produced by Step 3, not the positions from the start of the tick

#### Scenario: Demand injection occurs after all advancement steps
- **WHEN** `demandInterval > 0` and the current tick qualifies for injection
- **THEN** the new L3 item is added after Steps 1–7 have completed, so it is not processed in the tick it is created
