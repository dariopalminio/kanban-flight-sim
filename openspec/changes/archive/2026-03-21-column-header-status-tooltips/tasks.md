## 1. Verify description field availability

- [x] 1.1 Confirm `description` is present on the `Status` type in `src/domain/types.ts`
- [x] 1.2 Confirm `description` is populated on statuses in `src/config/defaultConfig.json` for both "Simplified" and "SDF workflows" simulations

## 2. Update Column component

- [x] 2.1 In `src/components/Column.tsx`, add `title={status.description || undefined}` to the column header container `<div>`

## 3. Verify in browser

- [x] 3.1 Run the app (`npm run dev`) and hover over column headers in the "Simplified" simulation — confirm the description tooltip appears
- [x] 3.2 Hover over column headers in the "SDF workflows" simulation — confirm tooltips show for all statuses that have descriptions
- [x] 3.3 Confirm no blank tooltip appears for any status that has no `description` defined
