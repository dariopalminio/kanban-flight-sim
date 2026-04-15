## 1. Update Column.tsx

- [x] 1.1 Add `useRef<HTMLButtonElement>` for the DoD button element
- [x] 1.2 Add `dodPosition` state (`{ top: number; left: number } | null`) to store fixed coordinates when the popover is open
- [x] 1.3 Update the DoD button click handler to compute `getBoundingClientRect()` from the button ref and store the coordinates in `dodPosition` (or clear it to close)
- [x] 1.4 Add a `useEffect` that, when `dodOpen` is true, attaches a `mousedown` listener on `document` to close the popover on outside click; clean up on close or unmount
- [x] 1.5 Replace the inline `dod-popover` div with a `ReactDOM.createPortal(...)` call that renders the popover into `document.body`, using `position: fixed` with `top` and `left` from `dodPosition`

## 2. Update App.css

- [x] 2.1 Change `.dod-popover` `position` from `absolute` to `fixed`
- [x] 2.2 Remove the `top`, `left`, and `right` properties (coordinates are now set via inline style in the portal)
- [x] 2.3 Add `min-width: 220px` and `max-width: 360px` to `.dod-popover`

## 3. Manual Verification

- [ ] 3.1 Open the SDF workflows simulation (10+ columns per board) and click a DoD button on a narrow column — confirm the popover is fully readable and not clipped
- [ ] 3.2 Confirm clicking the DoD button again hides the popover
- [ ] 3.3 Confirm clicking anywhere outside the popover hides it
- [ ] 3.4 Confirm the popover is anchored visually near the DoD button
