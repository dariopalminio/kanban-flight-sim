## MODIFIED Requirements

### Requirement: Probabilistic advancement
Each eligible workitem SHALL advance with probability `config.advanceProbability` (default 0.5) per tick. The probability is uniform across all levels and states. Eligibility is determined by hierarchical, WIP, and FIFO-queue rules first; probability is applied only to the eligible (front-of-queue) item within each column per step.

#### Scenario: Workitem may not advance even when eligible
- **WHEN** an eligible workitem is evaluated and the random draw fails
- **THEN** the workitem remains in its current status

#### Scenario: Workitem cannot advance beyond eligible state
- **WHEN** an item is at `isPosDeliveryPoint`
- **THEN** the item does not advance regardless of the probability draw

#### Scenario: hasReadySignal — Phase 1 draw sets ready state
- **WHEN** a workitem with `isReady` unset is in a `hasReadySignal` status and the probability draw succeeds
- **THEN** `isReady` becomes `true`; `statusId` is unchanged; no WIP check is performed

#### Scenario: hasReadySignal — Phase 2 draw pulls item forward
- **WHEN** a workitem with `isReady: true` is in a `hasReadySignal` status and the probability draw succeeds and WIP allows
- **THEN** `statusId` advances to the next status and `isReady` is cleared

#### Scenario: Non-front-of-queue items are ineligible
- **WHEN** a workitem is in a column but is not the front-of-queue (not the item with the lowest `enteredAt`)
- **THEN** the probability draw is never applied to it; it stays in its current status
