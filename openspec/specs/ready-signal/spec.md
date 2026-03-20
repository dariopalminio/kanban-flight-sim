## ADDED Requirements

### Requirement: Ready signal field on Status
A `Status` MAY include `hasReadySignal: true`. When set, workitems in that status go through a two-phase advancement: first they become "ready" (signaled), then they advance to the next status. Statuses without this field behave identically to the current behavior.

#### Scenario: Status with hasReadySignal loads correctly
- **WHEN** a status in `defaultConfig.json` has `"hasReadySignal": true`
- **THEN** the loaded `Status` object has `hasReadySignal: true` and the rest of its fields are unaffected

#### Scenario: Status without hasReadySignal is unchanged
- **WHEN** a status does not include `hasReadySignal`
- **THEN** the field is absent or `undefined` on the loaded `Status` — no behavioral change

---

### Requirement: Two-phase advancement in hasReadySignal statuses
A workitem in a status with `hasReadySignal: true` SHALL advance in two distinct phases across separate ticks:

1. **Phase 1 (Doing → Ready):** The workitem transitions from `isReady: undefined/false` to `isReady: true`. This happens probabilistically (same `advanceProbability`). The workitem does NOT change `statusId` in this phase.
2. **Phase 2 (Ready → Pull):** Once `isReady: true`, the workitem advances to the next `statusId` (subject to `advanceProbability` and WIP checks). When it leaves, `isReady` is cleared.

#### Scenario: Item becomes ready before advancing
- **WHEN** a workitem enters a `hasReadySignal` status
- **THEN** it starts with `isReady` unset; it MUST become `isReady: true` in some tick before it can advance to the next status

#### Scenario: Item in Phase 1 does not advance to next status
- **WHEN** a workitem has `isReady: false/undefined` in a `hasReadySignal` status and the probability draw succeeds
- **THEN** `isReady` becomes `true` and `statusId` remains unchanged

#### Scenario: Item in Phase 2 advances when pulled
- **WHEN** a workitem has `isReady: true` in a `hasReadySignal` status and the probability draw succeeds and WIP allows
- **THEN** `statusId` advances to the next status and `isReady` is cleared

#### Scenario: Item in Phase 2 waits if probability draw fails
- **WHEN** a workitem has `isReady: true` and the probability draw fails
- **THEN** `statusId` remains unchanged and `isReady` stays `true` (checkmark remains visible)

#### Scenario: WIP limit applies to all items in the status regardless of phase
- **WHEN** a `hasReadySignal` status has `wipLimit: 2` and contains 2 items (one in Phase 1, one in Phase 2)
- **THEN** no additional item can enter the status until one exits

---

### Requirement: Green checkmark on ready cards
A `Card` component SHALL display a green checkmark indicator (✓) when `item.isReady === true`. The indicator SHALL use inline CSS only and be visually distinct from the card's main content. Cards where `isReady` is not `true` SHALL show no indicator.

#### Scenario: Ready card shows green checkmark
- **WHEN** a workitem has `isReady: true`
- **THEN** the card displays a `✓` symbol in `#22c55e` (green)

#### Scenario: Non-ready card shows no checkmark
- **WHEN** a workitem has `isReady` unset or `false`
- **THEN** no checkmark appears on the card
