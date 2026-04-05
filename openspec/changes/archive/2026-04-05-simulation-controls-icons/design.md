## Context

`SimulationControls.tsx` currently renders five plain text buttons. `lucide-react` is the standard icon library for React projects and provides SVG icons as React components with configurable `size` and `color` props. It is not yet installed in the project.

## Goals / Non-Goals

**Goals:**
- Add `lucide-react` as a dependency
- Render one icon per button in `SimulationControls`, inline with the text label
- Keep styling and layout consistent with the existing toolbar (inline styles only)

**Non-Goals:**
- Icons in `SimulationSelector` or `KanbanSignalSelector`
- Replacing text labels with icons-only (labels are kept for clarity)
- Any animation or hover effects

## Decisions

### Icon mapping

| Button | Icon (lucide-react) |
|---|---|
| Step (forward one tick) | `ChevronRight` |
| Autoplay | `Play` |
| Pause | `Pause` |
| Reset | `RotateCcw` |
| Slower | `ChevronsLeft` |
| Faster | `ChevronsRight` |

**Rationale:** These are universally recognized media/navigation metaphors. `RotateCcw` for Reset is standard (counter-clockwise arrow = undo/restart). `ChevronsLeft/Right` convey speed adjustment direction.

### Icon size and alignment

Icons are rendered at `size={12}` (matching the 11px font) with `style={{ verticalAlign: "middle" }}` and a small `marginRight: 3` gap before the label text. This keeps button height unchanged.

**Alternative considered:** Icon-only buttons with `title` tooltip. Rejected — text labels aid discoverability for new users.

### Import strategy

Named imports per button usage: `import { Play, Pause, ChevronRight, RotateCcw, ChevronsLeft, ChevronsRight } from "lucide-react"`. Tree-shaking via Vite handles bundle size.

## Risks / Trade-offs

- [New external dependency] → `lucide-react` is a widely adopted, stable library (1M+ weekly downloads). Risk is low.
- [Button width increases slightly] → Icons add ~15px per button. The toolbar already wraps on small screens (`flexWrap: "wrap"`), so no layout breakage.
