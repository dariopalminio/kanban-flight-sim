## 1. Domain Type

- [x] 1.1 Extend `ViewMode` in `src/domain/types.ts` to `"portafolio" | "delivery" | "full"`

## 2. App Logic

- [x] 2.1 Update `visibleLevels` derivation in `App.tsx` to handle `"full"`: return `[3, 2, 1, 0]` when `viewMode === "full"`

## 3. Radio Button UI

- [x] 3.1 Add `"full"` to the `ViewMode[]` array mapped in the radio group so a third "Full" button is rendered

## 4. Verification

- [x] 4.1 Verify in browser: three radio buttons appear (Portafolio, Delivery, Full)
- [x] 4.2 Verify: selecting "Full" shows all four boards
- [x] 4.3 Verify: Portafolio and Delivery modes still work correctly
