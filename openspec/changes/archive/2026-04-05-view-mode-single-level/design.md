## Context

`ViewMode` is a union type in `domain/types.ts`. `visibleLevels` is computed in `App.tsx` as a simple conditional expression that maps each `ViewMode` value to an array of level numbers `[0..3]`. `SimulationSelector` renders the view mode as a `<select>` dropdown, iterating over a hardcoded array of `ViewMode` values.

The three existing modes and their level arrays:
- `"portafolio"` → `[3, 2]`
- `"delivery"` → `[2, 1, 0]`
- `"full"` → `[3, 2, 1, 0]`

## Goals / Non-Goals

**Goals:**
- Add `"L3"`, `"L2"`, `"L1"` as valid `ViewMode` values, each showing only the corresponding board
- Preserve all existing modes and their behavior unchanged

**Non-Goals:**
- Adding `"L0"` as a single-level view (L0 is never shown without its parent context in the current design — excluded per user request)
- Any change to board rendering logic in `Board.tsx`, `Column.tsx`, or `Card.tsx`

## Decisions

### New `visibleLevels` mapping

| ViewMode | visibleLevels |
|---|---|
| `"portafolio"` | `[3, 2]` |
| `"delivery"` | `[2, 1, 0]` |
| `"full"` | `[3, 2, 1, 0]` |
| `"L3"` | `[3]` |
| `"L2"` | `[2]` |
| `"L1"` | `[1]` |

The existing ternary chain in App.tsx will be extended with three more cases. Given there are now 6 modes, a lookup object is cleaner than a 6-level ternary:

```ts
const VISIBLE_LEVELS: Record<ViewMode, number[]> = {
  portafolio: [3, 2],
  delivery: [2, 1, 0],
  full: [3, 2, 1, 0],
  L3: [3],
  L2: [2],
  L1: [1],
};
const visibleLevels = VISIBLE_LEVELS[viewMode];
```

### Dropdown option order

Existing options first (Portafolio, Delivery, Full), then the three new ones (L3, L2, L1). This keeps backwards familiarity for existing users.

### Display labels

The option labels in the dropdown: "Portafolio", "Delivery", "Full", "L3", "L2", "L1". The existing capitalize-first logic (`mode.charAt(0).toUpperCase() + mode.slice(1)`) produces "Portafolio", "Delivery", "Full", "L3", "L2", "L1" — correct for all six values without any change to the label logic.

## Risks / Trade-offs

- [Minimal] The `visibleLevels` ternary chain replacement with a lookup object is a small refactor; it's strictly cleaner but slightly more change than strictly necessary. Acceptable given readability improvement.
