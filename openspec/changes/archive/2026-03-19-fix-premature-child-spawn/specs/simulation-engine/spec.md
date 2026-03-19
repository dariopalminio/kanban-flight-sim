## MODIFIED Requirements

### Requirement: Automatic child spawning at commitment point
When a parent item (L1/L2/L3) is at the status marked `isBeforeCommitmentPoint`, has no children yet, and the probabilistic draw succeeds and the WIP check for `firstDownstreamId` passes, the engine SHALL atomically:
1. Create exactly `config.childrenPerParent` children in the first status of the child level's workflow.
2. Move the parent to `firstDownstreamId`.

Children SHALL NOT be created if the parent cannot advance in that tick — either because the probability draw fails or because the WIP limit of `firstDownstreamId` is already reached. This applies symmetrically in Step 3 (L1→L0 children), Step 5 (L2→L1 children), and Step 7 (L3→L2 children).

#### Scenario: Children created only when parent successfully crosses commitment (Step 3)
- **WHEN** an L1 item is at `isBeforeCommitmentPoint`, has no L0 children, the probability draw succeeds, and `firstDownstreamId` has WIP capacity
- **THEN** exactly `childrenPerParent` L0 items are created in `wfL0.statuses[0]` AND the L1 item moves to `firstDownstreamId` in the same tick

#### Scenario: No children created when WIP blocks the crossing (Step 3)
- **WHEN** an L1 item is at `isBeforeCommitmentPoint`, has no L0 children, and `firstDownstreamId` has reached its `wipLimit`
- **THEN** no L0 children are created and the L1 item stays at `isBeforeCommitmentPoint`

#### Scenario: No children created when probability draw fails (Step 3)
- **WHEN** an L1 item is at `isBeforeCommitmentPoint`, has no L0 children, and the random draw fails
- **THEN** no L0 children are created and the L1 item remains at `isBeforeCommitmentPoint`

#### Scenario: Children not re-created on subsequent ticks (Step 3)
- **WHEN** an L1 item has already crossed commitment and has existing L0 children
- **THEN** no additional L0 children are created regardless of its current status

#### Scenario: Symmetric behavior for L2 at commitment (Step 5)
- **WHEN** an L2 item is at `isBeforeCommitmentPoint`, has no L1 children, and the crossing succeeds
- **THEN** exactly `childrenPerParent` L1 items are created AND the L2 item moves to its `firstDownstreamId`

#### Scenario: Symmetric behavior for L3 at commitment (Step 7)
- **WHEN** an L3 item is at `isBeforeCommitmentPoint`, has no L2 children, and the crossing succeeds
- **THEN** exactly `childrenPerParent` L2 items are created AND the L3 item moves to its `firstDownstreamId`
