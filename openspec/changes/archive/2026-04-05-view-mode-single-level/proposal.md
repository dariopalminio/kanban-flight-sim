## Why

The existing board view modes (Portafolio, Delivery, Full) always show multiple levels simultaneously. Users who want to focus on a single level — e.g., only L3 for strategic planning or only L1 for operational detail — have no way to isolate it. Adding single-level view modes reduces visual noise and allows focused analysis.

## What Changes

- Extend the `ViewMode` type in `domain/types.ts` to include three new values: `"L3"`, `"L2"`, `"L1"`
- Update the `visibleLevels` derivation in `App.tsx` to handle the three new modes
- Add the three new options to the board view mode `<select>` dropdown in `SimulationSelector.tsx`

## Capabilities

### New Capabilities

### Modified Capabilities

- `board-view-mode`: Adds three new single-level view modes (L3, L2, L1) to the existing view mode selector

## Impact

- `src/domain/types.ts`: `ViewMode` union extended with `"L3" | "L2" | "L1"`
- `src/App.tsx`: `visibleLevels` conditional extended with three new cases
- `src/components/SimulationSelector.tsx`: view mode `<select>` options list extended with L3, L2, L1
- No changes to engine, config, or other components
