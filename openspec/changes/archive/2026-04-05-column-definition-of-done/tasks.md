## 1. Extend Status Type

- [x] 1.1 Add `definitionOfDone?: string` to the `Status` type in `src/domain/types.ts`

## 2. DoD Button and Panel in Column

- [x] 2.1 Import `useState` in `src/components/Column.tsx` (add to the existing React import)
- [x] 2.2 Add `const [dodOpen, setDodOpen] = useState(false)` local state inside the `Column` component
- [x] 2.3 Set `position: "relative"` on the root `<div>` of `Column` so the DoD panel can be absolutely positioned
- [x] 2.4 In the column header `<div>`, after the buffer `✓` indicator, render a "DoD" `<button>` conditionally when `status.definitionOfDone` is a non-empty string; clicking it calls `setDodOpen((v) => !v)`
- [x] 2.5 Below the header `<div>` and above the cards container `<div>`, render the DoD panel conditionally when `dodOpen` is `true`: a `<div>` with `position: "absolute"`, `zIndex: 10`, dark background (e.g. `#0f172a`), light text (`#e2e8f0`), small font (`fontSize: 9`), padding and border, showing `status.definitionOfDone` text
