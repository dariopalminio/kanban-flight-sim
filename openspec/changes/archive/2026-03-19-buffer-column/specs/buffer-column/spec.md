## ADDED Requirements

### Requirement: isBuffer field on Status
A `Status` MAY include `isBuffer: true`. When set, it marks the column as a ready-by-nature buffer: all items in it are implicitly ready to be pulled. Statuses without this field behave identically to current behavior.

#### Scenario: Status with isBuffer loads correctly
- **WHEN** a status in `defaultConfig.json` has `"isBuffer": true`
- **THEN** the loaded `Status` object has `isBuffer: true` and all other fields are unaffected

#### Scenario: Status without isBuffer is unchanged
- **WHEN** a status does not include `isBuffer`
- **THEN** the field is absent or `undefined` on the loaded `Status` — no behavioral or visual change

---

### Requirement: Buffer column header indicator
A `Column` with `status.isBuffer === true` SHALL display a green ✓ indicator in its header AND a green top border, signaling that the entire column is a ready buffer. Columns without `isBuffer` SHALL show no such indicator.

#### Scenario: Buffer column header shows ✓ indicator
- **WHEN** a status has `isBuffer: true`
- **THEN** the column header displays a `✓` symbol in `#22c55e` (green) after the status name

#### Scenario: Buffer column has green top border
- **WHEN** a status has `isBuffer: true`
- **THEN** the column container has `borderTop: "2px solid #22c55e"`

#### Scenario: Non-buffer column shows no indicator
- **WHEN** a status does not have `isBuffer: true`
- **THEN** the column header and border are unchanged from current behavior

---

### Requirement: Card ready signal suppressed in buffer columns
Cards rendered inside a buffer column (`isBuffer: true`) SHALL NOT display individual ready signal styling (`isReady` badge, border, or glow), even if `item.isReady` is `true`. The column-level signal replaces the card-level signal.

#### Scenario: Card in buffer column shows no ready badge
- **WHEN** a workitem with `isReady: true` is in a column with `isBuffer: true`
- **THEN** the card renders without the green ✓ badge, green left border, and green glow

#### Scenario: Card in non-buffer column with isReady shows badge normally
- **WHEN** a workitem has `isReady: true` and is in a column where `isBuffer` is not set
- **THEN** the card displays the full ready signal styling as defined in the `ready-signal` spec

---

### Requirement: Pull semantics documentation
An item is pullable to the next stage if either:
1. It is in a column with `isBuffer: true`, OR
2. It is in a column with `hasReadySignal: true` AND `item.isReady === true`.

This is a semantic rule expressed in the engine via existing probabilistic advancement — no engine code change is required. The buffer and ready-signal features together form the complete pull signal system.

#### Scenario: Item in buffer is pullable
- **WHEN** a workitem is in a status with `isBuffer: true`
- **THEN** it advances to the next status subject only to `advanceProbability` and WIP limits (same as non-signal statuses)

#### Scenario: Item in hasReadySignal status is pullable only after ready
- **WHEN** a workitem is in a `hasReadySignal` status and `isReady` is not yet `true`
- **THEN** it cannot advance to the next status (Phase 1 only — becomes ready first)
