## Context

`Column.tsx` renders the DoD popover as a direct child of the `.kanban-column` div. That div has `position: relative` and `overflow: hidden` in `App.css`, so the absolutely-positioned popover is both contained and clipped by it. On narrow columns (the norm in SDF workflows with 10+ columns) the popover is forced to the column's width, making multi-sentence DoD texts unreadable.

## Goals / Non-Goals

**Goals:**
- Render the DoD panel as a floating overlay that is never clipped by any column ancestor.
- Keep all existing DoD toggle behaviour (show/hide on button click).
- Close the popover when the user clicks anywhere outside it.
- No new external dependencies.

**Non-Goals:**
- Repositioning the popover on scroll or window resize (the board is not designed for mobile; this edge case is acceptable).
- Animating the popover open/close.
- Changes to the simulation engine, config schema, or any other component.

## Decisions

### Decision 1 — React Portal rendered at `document.body`

**Chosen:** Use `ReactDOM.createPortal(popoverJSX, document.body)` inside `Column.tsx`.

**Why:** A portal moves the popover's DOM node outside the `.kanban-column` subtree entirely, escaping both the `overflow: hidden` clip and the `position: relative` containing block. It is the standard React pattern for tooltips and modals that must visually "break out" of a scroll container.

**Alternative considered — `overflow: visible` on `.kanban-column`:** Would unclip the popover but break card overflow containment, which is intentional (cards scroll within the column). Rejected.

**Alternative considered — `position: fixed` without portal:** Without moving the DOM node, `overflow: hidden` on an ancestor still clips a `position: fixed` child in some browsers (when the ancestor has `transform`, `filter`, or `will-change`). A portal is the safe, browser-consistent choice.

### Decision 2 — `position: fixed` with coordinates from `getBoundingClientRect()`

**Chosen:** Attach a `useRef` to the DoD button. On open, call `getBoundingClientRect()` to get the button's viewport position and set `top`/`left` on the portal div via inline style. Anchor the popover below-left of the button.

**Why:** Fixed positioning with explicit coordinates is immune to any ancestor `overflow`, `transform`, or `position` property. Computing from `getBoundingClientRect()` is the standard approach for tooltip anchoring in React without a library.

### Decision 3 — Close on outside click via `useEffect`

**Chosen:** When `dodOpen` is `true`, attach a `mousedown` listener on `document` that closes the popover if the click target is outside both the popover and the button. Remove the listener when closed or on unmount.

**Why:** This is the conventional pattern for dismissible floating panels. It does not require a global store or context change.

### Decision 4 — Fixed `min-width` / `max-width` on the popover

**Chosen:** Set `min-width: 220px` and `max-width: 360px` on `.dod-popover`. Text wraps within those bounds via `white-space: pre-wrap` (already present).

**Why:** Without a width constraint the popover would stretch to the text length on a single line. 220–360 px gives a comfortable reading width for the DoD texts in the existing config files.

## Risks / Trade-offs

- **Popover position on scroll:** If the user scrolls the page after opening the popover, the fixed popover stays at its original viewport position while the button moves. Risk is low — the board fits in one viewport; the user would need to scroll significantly. Mitigation: closing on outside click naturally handles this in most cases.
- **Multiple popovers open simultaneously:** Current implementation already prevents this (each `Column` has its own `dodOpen` state; there is no coordination). After this change, two popovers could overlap if two DoD buttons are clicked in sequence without closing the first. This is acceptable for the current use case — the user is expected to read one DoD at a time.
