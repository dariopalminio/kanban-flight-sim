## Why

Currently, all four Kanban boards (L3–L0) are always visible simultaneously, which can overwhelm users who are focused on a specific management perspective. A view-mode toggle lets users narrow the display to the boards relevant to their role — strategic/portfolio managers need L3+L2, while delivery teams need L2+L1+L0.

## What Changes

- Add a radio button group with two mutually-exclusive options: **Portafolio** and **Delivery**
- **Portafolio** mode: show L3 and L2 boards; hide L1 and L0
- **Delivery** mode: show L2, L1, and L0 boards; hide L3
- The selected view mode is stored in React state in `App.tsx` and passed down to control board visibility
- Default view mode is **Portafolio**

## Capabilities

### New Capabilities
- `board-view-mode`: Radio button control that filters which boards are rendered based on the selected view (Portafolio or Delivery)

### Modified Capabilities
- `kanban-board-ui`: Board visibility is now conditional — not all four boards are always shown; the active view mode determines which boards render

## Impact

- `App.tsx`: new `viewMode` state, new radio button UI, conditional board rendering
- `src/components/Board.tsx`: no changes needed (visibility controlled by parent)
- No changes to engine, config, or domain types
