## ADDED Requirements

### Requirement: currentTick prop threading through board components
The `Board`, `Column`, and `Card` components SHALL each accept a `currentTick: number` prop. `App` SHALL pass `simState.tick` as `currentTick` to each `<Board>`. `Board` SHALL pass it to each `<Column>`. `Column` SHALL pass it to each `<Card>`. This prop is used exclusively for the tick-flash-highlight feature.

#### Scenario: currentTick flows from App to Card
- **WHEN** `App` renders `<Board currentTick={simState.tick} ...>`
- **THEN** each `Card` rendered within that Board receives `currentTick` equal to `simState.tick`

#### Scenario: currentTick updates after every tick
- **WHEN** a tick executes and `simState.tick` increments by 1
- **THEN** all `Card` components receive the updated `currentTick` value in the same render cycle
