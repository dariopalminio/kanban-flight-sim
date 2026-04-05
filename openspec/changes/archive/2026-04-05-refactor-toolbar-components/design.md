## Context

`App.tsx` currently contains ~254 lines that combine: React state management, autoplay effect, simulation handler functions, and all toolbar JSX inline. The toolbar has three logical groups:

1. **Simulation selector** — selects which simulation to run + board view mode (Portafolio / Delivery / Full)
2. **Simulation controls** — Step, Autoplay/Pause, Reset, Slower, Faster, Tick counter, Tick ms display
3. **Kanban signal selector** — four mutually-exclusive highlight toggles (Upstream/Downstream, Status Category, Before Commitment Point, Pos Delivery Point)

The refactor extracts these into `src/components/SimulationSelector.tsx`, `src/components/SimulationControls.tsx`, and `src/components/KanbanSignalSelector.tsx`. No logic changes — this is a pure structural refactor.

## Goals / Non-Goals

**Goals:**
- Reduce App.tsx size by extracting toolbar JSX and related style constants into dedicated components
- Each new component receives only the props it needs (no prop drilling beyond what is necessary)
- Keep `BTN_STYLE` / `BTN_ACTIVE_STYLE` co-located with the components that use them

**Non-Goals:**
- No changes to simulation logic, engine, config, or domain types
- No introduction of React Context, custom hooks, or shared state management
- No changes to Board, Column, or Card components
- No visual or behavioral changes to the UI

## Decisions

### Props-only (no Context)
Each component receives state values and callbacks as plain props. The app is small (~250 lines); adding Context would be over-engineering for this refactor scope.

**Alternative considered:** React Context for shared toolbar state. Rejected — unnecessary complexity for three components receiving 2–5 props each.

### Style constants move with their components
`BTN_STYLE` and `BTN_ACTIVE_STYLE` are currently defined at the module level of `App.tsx`. They are only used by the two button-containing components (`SimulationControls` and `KanbanSignalSelector`). Each component will define its own copy, avoiding a shared style import.

**Alternative considered:** A shared `src/components/styles.ts` export. Rejected — premature abstraction; the styles are trivial and co-location is simpler.

### Component interfaces (props)

**`SimulationSelector`**
```ts
interface SimulationSelectorProps {
  selectedSim: string;
  simulationNames: string[];
  viewMode: ViewMode;
  onSimChange: (name: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
}
```

**`SimulationControls`**
```ts
interface SimulationControlsProps {
  tickCount: number;
  autoplayIntervalMs: number;
  isPlaying: boolean;
  canSlower: boolean;
  canFaster: boolean;
  onStep: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onSlower: () => void;
  onFaster: () => void;
}
```

**`KanbanSignalSelector`**
```ts
interface KanbanSignalSelectorProps {
  highlightMode: HighlightMode;
  onToggle: (mode: HighlightMode) => void;
}
```

## Risks / Trade-offs

- [Minor duplication of BTN_STYLE] → Acceptable given the small size and that styles are unlikely to diverge; can be consolidated later if needed.
- [No behavioral tests] → This project has no test framework; the refactor is verified visually. Risk is low since it is a pure extraction with no logic changes.
