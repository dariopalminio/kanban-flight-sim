## 1. Extend Config type

- [x] 1.1 In `src/domain/types.ts`, add `withoutL0?: boolean` to the `Config` type

## 2. Update simulation engine

- [x] 2.1 In `src/simulation/engine.ts`, extract `const withoutL0 = config.withoutL0 ?? false` at the top of `tick()`
- [x] 2.2 Wrap Step 1 (Advance L0 autonomously) with `if (!withoutL0) { ... }` so it is skipped when withoutL0 is true
- [x] 2.3 Wrap Step 2 (Push L1 to first downstream when any L0 child enters downstream) with `if (!withoutL0) { ... }`
- [x] 2.4 In Step 3, add early returns inside the `firstDownstreamOrder` and `secondDownstreamOrder` blocks: `if (withoutL0) { /* fall through to general pool */ return w; }`
- [x] 2.5 In Step 3, adjust the `l1GeneralColumns` filter to include `firstDownstreamOrder` and `secondDownstreamOrder` columns when `withoutL0` is true
- [x] 2.6 In Step 3 general L1 advancement, skip L0 child spawning at commitment point when `withoutL0` is true: wrap the `newL0Children.push(...)` block with `if (!withoutL0) { ... }`

## 3. Update SimulationSelector component

- [x] 3.1 Add `withoutL0: boolean` and `onWithoutL0Change: (v: boolean) => void` to `SimulationSelectorProps` interface
- [x] 3.2 Render a toggle button after the View dropdown: label "With L0" when false (default style), "Without L0" when true (active/highlighted style); `onClick` calls `onWithoutL0Change(!withoutL0)`

## 4. Update App.tsx

- [x] 4.1 Add `const [withoutL0, setWithoutL0] = useState(false)` state in `App`
- [x] 4.2 Create `const effectiveConfig = { ...config, withoutL0 }` and use it in place of `config` for all calls to `tick()` and `buildInitialState()`
- [x] 4.3 Add handler `handleWithoutL0Change`: sets `withoutL0` and immediately resets the simulation (calls `handleReset` logic with `effectiveConfig`)
- [x] 4.4 Pass `withoutL0` and `onWithoutL0Change={handleWithoutL0Change}` to `<SimulationSelector>`

## 5. Verify

- [x] 5.1 Run `npx tsc --noEmit` — no TypeScript errors
- [x] 5.2 Verify in browser: with toggle off, simulation runs normally with L0 items
- [x] 5.3 Verify in browser: with toggle on (Without L0), no L0 items appear, L1 advances through all statuses autonomously
- [x] 5.4 Verify that toggling resets the simulation (tick goes back to 0)
