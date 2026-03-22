## Why

Column headers display the status name but not the `description` field defined in `defaultConfig.json`. This leaves learners without context on what each stage represents, reducing the educational value of the simulation — especially for complex multi-status workflows like "SDF workflows" with 7–10 stages per level.

## What Changes

- Column header cells gain a native browser tooltip (`title` attribute) showing the status `description` when the user hovers over the header text or cell.
- The `Status` type and `defaultConfig.json` already include a `description` field; no data model changes are needed.
- `Column.tsx` is updated to read and render the tooltip.

## Capabilities

### New Capabilities

- `column-status-tooltip`: Column headers display the status `description` as a tooltip on hover.

### Modified Capabilities

- `kanban-board-ui`: The column header requirement gains a new tooltip display rule tied to the `description` field.

## Impact

- **`src/components/Column.tsx`** — add `title={status.description}` (or equivalent) to the column header element.
- **`openspec/specs/kanban-board-ui/spec.md`** — new requirement added under the column header section.
- No engine, config schema, or routing changes required.
