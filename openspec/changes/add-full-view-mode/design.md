## Context

The `portfolio-delivery-view-toggle` change introduced `ViewMode = "portafolio" | "delivery"` and a `visibleLevels` array derived from it. The radio group iterates over the `ViewMode` values to render buttons. Adding "full" is a purely additive change to both the type and the derivation logic.

## Goals / Non-Goals

**Goals:**
- Extend `ViewMode` to `'portafolio' | 'delivery' | 'full'`
- `visibleLevels` for `'full'` returns `[3, 2, 1, 0]`
- Radio group renders three options: Portafolio, Delivery, Full

**Non-Goals:**
- Changing default view mode (remains `'portafolio'`)
- Any engine or config changes

## Decisions

### Decision: Extend the union type, not a separate flag
Add `"full"` to `ViewMode` rather than a boolean `showAll` flag.
**Why:** Keeps the pattern consistent with the existing type; `visibleLevels` derivation remains a single expression; the radio group already maps over `ViewMode` values.

## Risks / Trade-offs

- No meaningful risks. This is a three-line change across two files.
