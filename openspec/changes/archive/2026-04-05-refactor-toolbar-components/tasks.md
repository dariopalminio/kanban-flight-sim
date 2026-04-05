## 1. Create SimulationSelector component

- [x] 1.1 Create `src/components/SimulationSelector.tsx` with `SimulationSelectorProps` interface (selectedSim, simulationNames, viewMode, onSimChange, onViewModeChange)
- [x] 1.2 Render "Simulations:" label and simulation `<select>` dropdown with inline styles (background `#0f172a`, color `white`, border `1px solid #475569`, border-radius `4`, font-size `11`, font-weight `600`)
- [x] 1.3 Render "View:" label and view mode `<select>` dropdown with options Portafolio / Delivery / Full and inline styles (background `#1e293b`)
- [x] 1.4 Wire `onChange` handlers to call `onSimChange` and `onViewModeChange` respectively

## 2. Create SimulationControls component

- [x] 2.1 Create `src/components/SimulationControls.tsx` with `SimulationControlsProps` interface (tickCount, autoplayIntervalMs, isPlaying, canSlower, canFaster, onStep, onTogglePlay, onReset, onSlower, onFaster)
- [x] 2.2 Define `BTN_STYLE` and `BTN_ACTIVE_STYLE` inline style constants inside the file
- [x] 2.3 Render "Tick: {tickCount}" and "Tick ms: {autoplayIntervalMs}" read-only labels
- [x] 2.4 Render Step button (disabled when isPlaying), Autoplay/Pause toggle button (active style when isPlaying), and Reset button
- [x] 2.5 Render Slower button (disabled when !canSlower) and Faster button (disabled when !canFaster)

## 3. Create KanbanSignalSelector component

- [x] 3.1 Create `src/components/KanbanSignalSelector.tsx` with `KanbanSignalSelectorProps` interface (highlightMode, onToggle)
- [x] 3.2 Define `BTN_STYLE` and `BTN_ACTIVE_STYLE` inline style constants inside the file
- [x] 3.3 Render four toggle buttons: "Upstream / Downstream" (stream), "Status Category" (category), "Before Commitment Point" (commitment), "Pos Delivery Point" (delivery)
- [x] 3.4 Apply active style to the button matching current `highlightMode`, default style to all others
- [x] 3.5 Wire each button `onClick` to call `onToggle` with its corresponding `HighlightMode` value

## 4. Refactor App.tsx to use new components

- [x] 4.1 Import `SimulationSelector`, `SimulationControls`, and `KanbanSignalSelector` in `App.tsx`
- [x] 4.2 Remove `BTN_STYLE` and `BTN_ACTIVE_STYLE` constants from `App.tsx` (they move to the components)
- [x] 4.3 Replace simulation selector JSX block with `<SimulationSelector>` passing appropriate props
- [x] 4.4 Replace simulation controls JSX block with `<SimulationControls>` passing appropriate props (compute `canSlower` and `canFaster` booleans in App.tsx before passing)
- [x] 4.5 Replace view toggles JSX block with `<KanbanSignalSelector>` passing appropriate props
- [x] 4.6 Verify the app builds without TypeScript errors (`npm run build` or `npx tsc --noEmit`)
- [x] 4.7 Verify the app renders correctly in the browser with no visual or behavioral regressions
