## 1. Verify Simulation Engine Spec

- [x] 1.1 Cross-check the 7-step tick order in `specs/simulation-engine/spec.md` against `src/simulation/engine.ts`
- [x] 1.2 Confirm probabilistic advancement rule matches `maybe()` usage in engine
- [x] 1.3 Confirm intra-tick WIP tracker behavior matches `makeWipTracker` closure in engine
- [x] 1.4 Confirm downstream-push and hierarchical-blocking scenarios against Steps 2–7 in engine

## 2. Verify Workitem Lifecycle Spec

- [x] 2.1 Cross-check ID generation scheme against `nextId()` and `idPrefix()` in engine
- [x] 2.2 Confirm child-spawning logic (commitment point, childrenPerParent) against Steps 3, 5, 7 in engine
- [x] 2.3 Confirm `buildInitialState` behavior (L3 only, first status, counter init) matches spec

## 3. Verify Simulation Configuration Spec

- [x] 3.1 Cross-check status properties table against `src/domain/types.ts` `Status` type
- [x] 3.2 Confirm `category` derivation rule matches `assignCategory()` in `src/config/defaultConfig.ts`
- [x] 3.3 Verify "Simplified" simulation statuses and WIP limits match `src/config/defaultConfig.json`
- [x] 3.4 Verify "SDF workflows" simulation statuses and WIP limits match `src/config/defaultConfig.json`

## 4. Verify Kanban Board UI Spec

- [x] 4.1 Confirm board header colors match `LEVEL_HEADER_COLORS` in `src/components/Board.tsx`
- [x] 4.2 Confirm card colors match `LEVEL_COLORS` in `src/components/Card.tsx`
- [x] 4.3 Confirm column highlight color table matches `getBg()` and `getBorder()` in `src/components/Column.tsx`
- [x] 4.4 Confirm WIP display format and commitment-point underline match Column header rendering

## 5. Verify Simulation Controls Spec

- [x] 5.1 Confirm Step/Autoplay/Pause/Reset behavior against `App.tsx` handlers
- [x] 5.2 Confirm autoplay interval (1000 ms) matches `AUTOPLAY_INTERVAL_MS` constant in App.tsx
- [x] 5.3 Confirm mutual-exclusion toggle logic matches `toggleView()` implementation in App.tsx
- [x] 5.4 Confirm simulation selector reset behavior (stops autoplay, resets state) matches `handleSimChange()`

## 6. Publish Specs to openspec/specs/

- [x] 6.1 Copy (or move) `specs/simulation-engine/spec.md` → `openspec/specs/simulation-engine/spec.md`
- [x] 6.2 Copy (or move) `specs/workitem-lifecycle/spec.md` → `openspec/specs/workitem-lifecycle/spec.md`
- [x] 6.3 Copy (or move) `specs/simulation-configuration/spec.md` → `openspec/specs/simulation-configuration/spec.md`
- [x] 6.4 Copy (or move) `specs/kanban-board-ui/spec.md` → `openspec/specs/kanban-board-ui/spec.md`
- [x] 6.5 Copy (or move) `specs/simulation-controls/spec.md` → `openspec/specs/simulation-controls/spec.md`
