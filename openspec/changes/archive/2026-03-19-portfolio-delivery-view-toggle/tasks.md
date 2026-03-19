## 1. Domain Type

- [x] 1.1 Add `ViewMode = 'portafolio' | 'delivery'` export to `src/domain/types.ts`

## 2. App State & Logic

- [x] 2.1 Import `ViewMode` in `App.tsx`
- [x] 2.2 Add `const [viewMode, setViewMode] = useState<ViewMode>('portafolio')` state in `App.tsx`
- [x] 2.3 Derive `visibleLevels` array: `viewMode === 'portafolio' ? [3, 2] : [2, 1, 0]`
- [x] 2.4 Wrap each `<Board>` render in a conditional so only boards whose level is in `visibleLevels` are mounted

## 3. Radio Button UI

- [x] 3.1 Add a radio button group in the controls section of `App.tsx` with two `<label>/<input type="radio">` pairs: "Portafolio" and "Delivery"
- [x] 3.2 Bind radio inputs to `viewMode` state (checked + onChange)
- [x] 3.3 Apply inline styles consistent with the app's dark theme (white label text, matching spacing to existing controls)

## 4. Verification

- [x] 4.1 Verify in browser: default load shows only L3 and L2 boards with "Portafolio" selected
- [x] 4.2 Verify in browser: switching to "Delivery" shows L2, L1, L0 and hides L3
- [x] 4.3 Verify simulation state (tick, cards) is preserved when switching view modes
