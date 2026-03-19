## Context

`App.tsx` currently renders all four boards (L3, L2, L1, L0) unconditionally in a vertical stack. There is no mechanism to filter which boards are visible. The existing `HighlightMode` pattern already shows how mutually-exclusive UI state can be managed in React (`useState`) and passed down as props — the view-mode toggle follows the same pattern.

No changes to the simulation engine, config schema, or domain types are required.

## Goals / Non-Goals

**Goals:**
- Add a `ViewMode` type (`'portafolio' | 'delivery'`) to `domain/types.ts`
- Add a radio button group in the control panel (App.tsx) that switches between Portafolio and Delivery modes
- Portafolio mode renders L3 + L2; Delivery mode renders L2 + L1 + L0
- Default view mode on load: `portafolio`
- Styling consistent with existing inline-style convention (no CSS classes)

**Non-Goals:**
- Persisting the selected view mode across page reloads
- Adding a third or custom view mode
- Changing simulation logic, engine, or config schema

## Decisions

### Decision 1: New `ViewMode` type in `domain/types.ts`
Add `export type ViewMode = 'portafolio' | 'delivery'` alongside the existing `HighlightMode` type.
**Why:** Keeps all UI-state type definitions co-located in the domain types file, consistent with `HighlightMode`.

### Decision 2: State lives in `App.tsx` as `useState<ViewMode>`
The `viewMode` state is held in `App.tsx` alongside the existing `highlightMode` state. Board visibility is computed inline via a derived set: `const visibleLevels = viewMode === 'portafolio' ? [3, 2] : [2, 1, 0]`.
**Why:** No new context or prop-drilling beyond what already exists. Board components don't need to know about view mode — the parent simply omits the board from the render tree.

### Decision 3: Conditional rendering via `visibleLevels` array (not CSS display:none)
Boards not in `visibleLevels` are not mounted at all (not just hidden).
**Why:** Simpler, avoids stale state in unmounted boards, and reduces DOM size.
**Alternative considered:** Setting `display: 'none'` via style prop — rejected because it still mounts the component and is semantically misleading.

### Decision 4: Radio button group placed in the existing control panel
The two radio buttons (`Portafolio` / `Delivery`) are placed in the controls section of `App.tsx`, next to the existing highlight-mode buttons.
**Why:** Groups all view-control UI in one place; no new components needed.
**Styling:** Radio inputs with `<label>` wrappers, inline styles matching the app's dark theme (white text, no external library).

## Risks / Trade-offs

- **L2 board appears in both modes** → This is intentional per requirements. L2 is the shared "bridge" level. No risk, but worth documenting for future maintainers.
- **No persistence** → Users lose their selected mode on page reload. Acceptable for an educational simulator where each session is independent.
- **Naming: "Portafolio" vs "Portfolio"** → Using the user-specified Spanish spelling `Portafolio` for the label; the TypeScript identifier uses the same string to avoid confusion.
