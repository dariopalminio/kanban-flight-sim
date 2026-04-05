## Context

The engine's `tick()` function has 8 steps. Steps 1–3 involve L0:

- **Step 1**: Advance L0 autonomously (FIFO per column)
- **Step 2**: Push L1 to first-downstream when any L0 child enters downstream
- **Step 3**: Advance L1 with hierarchical rules, which includes:
  - At `firstDownstreamOrder`: advance L1 to second-downstream if any L0 child reaches `secondDownstreamOrder`
  - At `secondDownstreamOrder`: advance L1 to next status if all L0 children are at delivery point
  - At general columns: spawn L0 children at L1's commitment point

Without L0, these rules must be bypassed. L1 must advance autonomously through all statuses, including `firstDownstream` and `secondDownstream`.

## Goals / Non-Goals

**Goals:**
- Skip all L0 engine logic when `config.withoutL0 = true`
- L1 advances probabilistically through every status (including downstream) with no L0 blocking
- UI toggle in `SimulationSelector` resets the simulation on toggle
- No visual or behavioral change when `withoutL0` is false (default)

**Non-Goals:**
- Persisting `withoutL0` in `defaultConfig.json` — it is a runtime toggle only
- Hiding/showing L0 in existing view modes — existing view modes are unchanged; the L0 board simply has no items when `withoutL0=true`

## Decisions

### Config field vs. tick() options parameter

`withoutL0` is added as an optional field to `Config` (`withoutL0?: boolean`, defaults to `false`). In `App.tsx`, a modified config object is constructed: `const effectiveConfig = { ...config, withoutL0 }`. This is passed to both `tick()` and `buildInitialState()`.

**Alternative considered:** Add a second `options` argument to `tick()`. Rejected — the existing pattern is `tick(state, config)` and all callers pass two arguments. Extending `Config` is the path of least resistance.

### Engine changes for Step 3 (L1 advancement) when `withoutL0=true`

When `withoutL0=true`, the hierarchical blocks for L1's `firstDownstreamOrder` and `secondDownstreamOrder` columns are skipped, and these two columns join the **general advancement pool** so L1 advances probabilistically:

```
// Step 3 when withoutL0=true:
// - firstDownstream and secondDownstream treated as regular columns
// - No L0 children spawned at commitment point
// - General pool includes ALL L1 non-delivery columns
```

The two special blocks (`order === firstDownstreamOrder`, `order === secondDownstreamOrder`) return early without doing anything when `withoutL0=true`. The `l1GeneralColumns` filter is also adjusted to include those two orders when `withoutL0=true`.

### Simulation reset on toggle

When the user toggles `withoutL0`, `handleReset()` is called immediately after updating `withoutL0` state. This ensures no orphaned L0 workitems exist. The reset clears all items and restarts from tick 0.

### Toggle UI in SimulationSelector

A simple `<button>` toggle is used (consistent with existing button styles). Label: "With L0" (active, highlighted) / "Without L0" (active when withoutL0=true, highlighted). Two new props added to `SimulationSelector`: `withoutL0: boolean` and `onWithoutL0Change: (v: boolean) => void`.

## Risks / Trade-offs

- [Step 3 guard complexity] → The change adds two `if (withoutL0) return w` early returns inside the `items.map()` of Step 3, and adjusts the `l1GeneralColumns` filter. This is minimal and localized.
- [Engine pure-function contract] → The tick() function remains pure. `config.withoutL0` is an immutable input.
- [No L0 board to display] → When `withoutL0=true` and a single-level view mode (L1, L2, L3, full, portafolio, delivery) is selected, the L0 board may or may not be in scope. Since there are no L0 items, the L0 board renders as empty — acceptable behavior. Users can select "L1" or "Delivery" view mode to hide L0 board.
