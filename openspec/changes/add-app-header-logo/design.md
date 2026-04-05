## Context

The app currently renders its simulation controls bar as the first visible element. There is no app-level branding — no logo and no title — so the UI lacks identity. The logo asset (`src/assets/logo-kanban-flight-sim.svg`) already exists and just needs to be surfaced.

## Goals / Non-Goals

**Goals:**
- Render a small branded header at the very top of `App.tsx` showing the SVG logo and the title "Kanba-Flight-Sim"
- Remain consistent with the existing inline-style-only convention

**Non-Goals:**
- No new component file — the header is simple enough to inline in `App.tsx`
- No routing, no navigation, no responsive breakpoints
- No changes to the simulation engine, config, or domain types

## Decisions

**Decision: Inline markup in `App.tsx`, not a separate component**
The header is a single `<div>` with an `<img>` and an `<h1>`. Extracting it to a component would add indirection with no benefit for this scope.

**Decision: Import the SVG as a module URL via Vite**
Vite resolves `import logoUrl from './assets/logo-kanban-flight-sim.svg'` as a URL string, which is compatible with `<img src={logoUrl} />`. This is idiomatic Vite usage and avoids hardcoding a public path.

**Decision: Inline styles consistent with the rest of the codebase**
The project uses no CSS classes or modules. The header will use inline style props matching the dark `#0f172a` background palette already in use.

## Risks / Trade-offs

- [Risk: SVG displays at wrong size] → Set explicit `height`/`width` on the `<img>` tag to pin dimensions.
- [Risk: Header takes too much vertical space] → Keep height minimal (logo ~28–32 px tall, padding snug) so boards still dominate the viewport.
