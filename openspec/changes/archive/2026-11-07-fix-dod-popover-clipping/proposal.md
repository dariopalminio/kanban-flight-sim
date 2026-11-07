## Why

The DoD popover is rendered as a child of `.kanban-column`, which has `overflow: hidden` and acts as the `position: absolute` containing block. This clips the popover to the column's width, making long DoD texts unreadable. The panel must be able to expand beyond the column boundary.

## What Changes

- Replace the inline `position: absolute` popover with a React Portal rendered at `document.body` level, positioned using `position: fixed` coordinates derived from the DoD button's `getBoundingClientRect()`.
- The popover will have a minimum and maximum readable width, independent of column size.
- Clicking outside the popover (or clicking the DoD button again) dismisses it.
- No changes to the config schema, simulation engine, or other components.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `column-definition-of-done`: The DoD panel must no longer be constrained by the column's width or `overflow: hidden`. It must render as a floating overlay that escapes the column's layout bounds and remains fully readable regardless of column size.

## Impact

- **`src/components/Column.tsx`**: Add a React Portal + `useRef` on the DoD button to compute fixed position. Add a `useEffect` to close on outside click.
- **`src/App.css`**: Update `.dod-popover` to use `position: fixed`, remove `left`/`right` constraints, add `min-width`/`max-width`.
- **`openspec/specs/column-definition-of-done/spec.md`**: Delta to relax the "panel within the column" DOM constraint and specify the floating overlay behavior.
