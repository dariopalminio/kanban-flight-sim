## Why

The current view mode selector only offers "Portafolio" (L3+L2) and "Delivery" (L2+L1+L0), with no way to see all four boards at once. A "Full" option lets users observe the entire system simultaneously, which is useful for demonstrations and understanding the complete flow.

## What Changes

- Add a third radio button option **"Full"** to the board view mode selector
- When "Full" is selected, all four boards (L3, L2, L1, L0) are visible simultaneously
- `ViewMode` type extended from `'portafolio' | 'delivery'` to include `'full'`

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `board-view-mode`: Adds a third view mode (`full`) that shows all four boards; the radio group now has three options instead of two

## Impact

- `src/domain/types.ts`: `ViewMode` union gains `"full"`
- `src/App.tsx`: `visibleLevels` logic updated; radio group renders three options
