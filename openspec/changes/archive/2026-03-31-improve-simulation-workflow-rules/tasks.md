## 1. Extend engine helpers with second-downstream key

- [x] 1.1 Add `secondDownstreamId: string` and `secondDownstreamOrder: number` fields to the `WfKeys` type in `engine.ts`
- [x] 1.2 Implement derivation of `secondDownstreamId/secondDownstreamOrder` in `getWfKeys()`: find the second status (by order) with `streamType === "DOWNSTREAM"`; throw if fewer than two downstream statuses exist
- [x] 1.3 Add helper `anyAtOrPastOrder(wf: Workflow, items: Workitem[], order: number): boolean` that returns `true` if any item's status order is >= the given order

## 2. Replace blocking gate with trigger-up progression (Steps 3, 5, 7)

- [x] 2.1 In Step 3 (L1 advancement): replace the `allAtDelivery` gate at `firstDownstreamOrder` with an `anyAtOrPastOrder(wfL0, children, keysL0.secondDownstreamOrder)` check; on match, advance L1 to `keysL1.secondDownstreamId` (subject to WIP via `wipL1`)
- [x] 2.2 In Step 5 (L2 advancement): same — replace `allAtDelivery` gate at `firstDownstreamOrder` with `anyAtOrPastOrder(wfL1, children, keysL1.secondDownstreamOrder)`; advance L2 to `keysL2.secondDownstreamId`
- [x] 2.3 In Step 7 (L3 advancement): same — replace `allAtDelivery` gate at `firstDownstreamOrder` with `anyAtOrPastOrder(wfL2, children, keysL2.secondDownstreamOrder)`; advance L3 to `keysL3.secondDownstreamId`

## 3. Add trigger-up auto-ready block at second-downstream (Steps 3, 5, 7)

- [x] 3.1 In Step 3 (L1 advancement): add a branch for `order === keysL1.secondDownstreamOrder` — if all L0 children at delivery AND `!w.isReady` then return `{ ...w, isReady: true }`; if `w.isReady` then apply Phase 2 pull (probabilistic advance to next status, WIP-checked); otherwise block (return w)
- [x] 3.2 In Step 5 (L2 advancement): same branch for `order === keysL2.secondDownstreamOrder` with L1 children
- [x] 3.3 In Step 7 (L3 advancement): same branch for `order === keysL3.secondDownstreamOrder` with L2 children

## 4. Verify behavior manually in browser

- [x] 4.1 Run the dev server (`npm run dev`), load the **SDF workflows** simulation, and step through ticks to confirm: L3 advances from first-downstream to second-downstream when first L2 child hits `release-develop`; L3 is marked ready (green checkmark) when all L2 children reach delivery
- [x] 4.2 Verify that the **Simplified** simulation still runs without errors and that parent items advance to their delivery state when the first child completes (behavioral change from the old blocking gate is expected)
