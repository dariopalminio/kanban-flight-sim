## Context

`Column.tsx` already receives the full `Status` object as a prop (it uses `id`, `name`, `wipLimit`, `isBeforeCommitmentPoint`, `isBuffer`, etc.). The `Status` type in `types.ts` includes a `description` field, and `defaultConfig.json` already defines descriptions for each status. No data model or engine changes are needed — this is a pure rendering concern confined to `Column.tsx`.

## Goals / Non-Goals

**Goals:**
- Display the status `description` as a hover tooltip on the column header.
- Use the native browser `title` attribute — no custom tooltip component needed.
- Handle missing/empty descriptions gracefully (show no tooltip if `description` is absent or blank).

**Non-Goals:**
- Custom-styled tooltip popups (beyond native browser tooltip).
- Tooltips on cards or board headers.
- Changes to the simulation engine, config schema, or data model.

## Decisions

### Native `title` attribute over a custom tooltip component

The project uses no external UI libraries and avoids added complexity. The native `title` attribute requires a single-line change, works across all browsers, and is sufficient for an educational tool where precision styling is not required. A custom React tooltip would add unnecessary code for this use case.

### Attach to the header `<div>` (the entire cell), not just the text node

The column header is a `<div>` containing the status name text and optional WIP / buffer indicators. Attaching `title` to the container `<div>` makes the entire header cell hoverable, matching the user expectation of "hovering over the text or cell." This is consistent with how all other header properties are set on that element.

### Conditional rendering: only set `title` when `description` is non-empty

Some simulations may define statuses without a `description`. Setting `title=""` produces a blank tooltip on hover in some browsers. The implementation should set `title={status.description || undefined}` so the attribute is omitted entirely when there is no description.

## Risks / Trade-offs

- **Browser tooltip delay/styling varies** — Native tooltips have OS/browser-dependent styling and a delay before they appear. This is acceptable for an educational context; a custom tooltip is a future enhancement if needed.
- **Long descriptions may be truncated** — Browser `title` tooltips truncate long strings on some platforms. Description text in `defaultConfig.json` should be kept concise (1–2 sentences). No mitigation needed now; add a lint/validation rule later if descriptions grow verbose.
