## Context

Column WIP limits are currently static values embedded in `defaultConfig.json` and read as `status.wipLimit` (an optional `number`) on each `Status` object. The engine's `makeWipTracker` enforces these limits during each `tick()` call. There is no mechanism to change WIP limits at runtime without editing the JSON file and reloading.

The app already uses a pattern of composing an `effectiveConfig` by merging runtime flags into the base config before passing it to `tick()` and `buildInitialState()` (e.g., `withoutL0`). This same pattern is the natural extension point for WIP limit overrides.

## Goals / Non-Goals

**Goals:**
- Allow users to edit WIP limits inline in column headers while a simulation is running.
- Override values take effect on the next tick, with no page reload.
- Overrides are ephemeral: they reset when the simulation is reset or a different simulation is selected.
- Columns without a configured `wipLimit` do NOT get an editable input (no WIP limit = unlimited; the user cannot impose one from the UI).

**Non-Goals:**
- Persisting overrides across sessions (no localStorage, no backend).
- Allowing users to add WIP limits to columns that had none in the config.
- Changing WIP limits on columns without an existing `wipLimit` in config.

## Decisions

### Decision 1: Override state lives in `App`, merged into `effectiveConfig`

`App` holds `wipLimitOverrides: Record<string, number>` (keyed by `status.id`). Before each `tick()` and before rendering, `effectiveConfig` patches `status.wipLimit` for any status whose id appears in the overrides map.

**Why over alternatives:**
- *Alternative: pass overrides as a separate prop to the engine* — would break the `tick(state, config) → state` pure function contract, requiring a new parameter.
- *Alternative: store overrides in `Column` local state* — the engine has no visibility into component state; overrides would never reach `tick()`.
- Merging into `effectiveConfig` keeps the engine untouched and extends the existing composition pattern.

### Decision 2: Prop threading via `onWipLimitChange` callback

`App` passes an `onWipLimitChange: (statusId: string, value: number) => void` callback to `Board`, which forwards it to each `Column`. `Column` renders an `<input type="number">` in the header (only when `status.wipLimit != null`) that fires this callback on change.

**Why:** The alternative of a React context would be heavier and unwarranted for a single callback in a shallow 3-level tree.

### Decision 3: Input replaces the static limit number only

The current header format is `name [w: current / l: limit]`. The limit portion (`limit`) becomes an `<input type="number">` styled inline. The "current" count remains static text. The input uses `min="1"` to prevent zero/negative limits.

**Why:** Replacing only the limit number keeps the familiar counter format and avoids rethinking the full header layout.

### Decision 4: Overrides reset on simulation change or reset

`handleSimChange` and `handleReset` both call `setWipLimitOverrides({})` in addition to their existing logic. This ensures the user always starts from the config-defined limits.

## Risks / Trade-offs

- **[Risk] User sets WIP limit lower than current column occupancy** → The engine's `makeWipTracker` initializes each column count from the current state at the start of a tick, so a newly tightened limit will simply block new arrivals on the next tick without removing existing items. This is consistent with how WIP limits already work in the engine and is the expected Kanban behavior.
- **[Risk] Input field blurs mid-autoplay** → Since the input fires `onChange` (not `onBlur`), every keystroke immediately updates state and triggers a re-render. During autoplay the column re-renders each tick, which will reset the input's DOM value if the user is mid-edit. Mitigation: use local `useState` in `Column` for the input draft value, only calling `onWipLimitChange` on `onBlur` or `onKeyDown Enter`.
- **[Trade-off] No persistence** → Acceptable for an educational tool; users can set limits at the start of a session.
