## 1. Add Constants to Column.tsx

- [x] 1.1 Add the constant `DONE_COLUMN_SCROLL_THRESHOLD = 4` at the top of `src/components/Column.tsx` (module scope, before the component)
- [x] 1.2 Add the constant `CARD_HEIGHT_PX` (estimated card height in px, e.g. `18`) alongside `DONE_COLUMN_SCROLL_THRESHOLD` to compute `maxHeight`

## 2. Wrap Cards in a Scrollable Container

- [x] 2.1 In the `Column` component JSX, wrap all `<Card>` renders in a new inner `<div>` that is separate from the column header `<div>`
- [x] 2.2 Apply `overflowY: "auto"` and `maxHeight: DONE_COLUMN_SCROLL_THRESHOLD * CARD_HEIGHT_PX` to the inner cards `<div>` **only** when `status.statusCategory === "DONE"` and `sortedItems.length > DONE_COLUMN_SCROLL_THRESHOLD`; otherwise no `maxHeight` nor `overflowY` constraint
