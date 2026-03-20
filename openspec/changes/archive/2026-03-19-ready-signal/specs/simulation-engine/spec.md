## MODIFIED Requirements

### Requirement: Probabilistic advancement
Each eligible workitem SHALL advance with probability `config.advanceProbability` per tick. For workitems in statuses with `hasReadySignal: true`, "advance" means:
- If `isReady` is not set: transition to `isReady: true` (same status, one probability draw).
- If `isReady: true`: transition to the next `statusId` (one probability draw, WIP checked).

For all other statuses, advancement remains a single-phase probability draw as before.

#### Scenario: Workitem may not advance even when eligible (unchanged)
- **WHEN** an eligible workitem is evaluated and the random draw fails
- **THEN** the workitem remains in its current status

#### Scenario: Workitem cannot advance beyond eligible state (unchanged)
- **WHEN** an item is at `isPosDeliveryPoint`
- **THEN** the item does not advance regardless of the probability draw

#### Scenario: hasReadySignal — Phase 1 draw sets ready state
- **WHEN** a workitem with `isReady` unset is in a `hasReadySignal` status and the probability draw succeeds
- **THEN** `isReady` becomes `true`; `statusId` is unchanged; no WIP check is performed

#### Scenario: hasReadySignal — Phase 2 draw pulls item forward
- **WHEN** a workitem with `isReady: true` is in a `hasReadySignal` status and the probability draw succeeds and WIP allows
- **THEN** `statusId` advances to the next status and `isReady` is cleared
