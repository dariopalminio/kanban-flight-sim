## 1. Install dependency

- [x] 1.1 Run `npm install lucide-react` and verify it appears in `package.json` dependencies

## 2. Update SimulationControls component

- [x] 2.1 Add named imports from `lucide-react` in `SimulationControls.tsx`: `ChevronRight`, `Play`, `Pause`, `RotateCcw`, `ChevronsLeft`, `ChevronsRight`
- [x] 2.2 Add icon to the Step button: render `<ChevronRight size={12} style={{ verticalAlign: "middle", marginRight: 3 }} />` before the label
- [x] 2.3 Add icon to the Autoplay/Pause button: render `<Play>` when not playing, `<Pause>` when playing (same size/style)
- [x] 2.4 Add icon to the Reset button: render `<RotateCcw size={12} style={{ verticalAlign: "middle", marginRight: 3 }} />`
- [x] 2.5 Add icon to the Slower button: render `<ChevronsLeft size={12} style={{ verticalAlign: "middle", marginRight: 3 }} />`
- [x] 2.6 Add icon to the Faster button: render `<ChevronsRight size={12} style={{ verticalAlign: "middle", marginRight: 3 }} />`

## 3. Verify

- [x] 3.1 Run `npx tsc --noEmit` — no TypeScript errors
- [x] 3.2 Verify buttons display icons alongside labels in the browser with no layout regressions
