## 1. Extend ViewMode type

- [x] 1.1 In `src/domain/types.ts`, extend `ViewMode` to `"portafolio" | "delivery" | "full" | "L3" | "L2" | "L1"`

## 2. Update visibleLevels logic in App.tsx

- [x] 2.1 Replace the ternary chain for `visibleLevels` in `App.tsx` with a `VISIBLE_LEVELS` lookup object covering all six modes: `portafolio: [3,2]`, `delivery: [2,1,0]`, `full: [3,2,1,0]`, `L3: [3]`, `L2: [2]`, `L1: [1]`
- [x] 2.2 Replace the ternary expression `visibleLevels = ...` with `const visibleLevels = VISIBLE_LEVELS[viewMode]`

## 3. Update SimulationSelector dropdown

- [x] 3.1 In `src/components/SimulationSelector.tsx`, extend the view mode options array from `["portafolio", "delivery", "full"]` to `["portafolio", "delivery", "full", "L3", "L2", "L1"]`

## 4. Verify

- [x] 4.1 Run `npx tsc --noEmit` — no TypeScript errors
- [x] 4.2 Verify in browser: selecting L3 shows only L3 board, L2 shows only L2 board, L1 shows only L1 board
- [x] 4.3 Verify existing modes (Portafolio, Delivery, Full) still work correctly
