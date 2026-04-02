## 1. Interval State And Constraints

- [x] 1.1 Add interval constants (`MIN`, `MAX`, `STEP`, `DEFAULT`) in `src/App.tsx` and replace fixed autoplay constant usage.
- [x] 1.2 Add `autoplayIntervalMs` React state with default value and helper updates that clamp to min/max bounds.

## 2. Autoplay Effect Integration

- [x] 2.1 Update autoplay `useEffect` to use `autoplayIntervalMs` and include it in dependencies so interval changes apply immediately while playing.
- [x] 2.2 Ensure simulation reset/simulation change behavior preserves expected speed default behavior per spec.

## 3. Header Controls UI

- [x] 3.1 Add compact `Slower` and `Faster` buttons in header controls to adjust `autoplayIntervalMs` by fixed step.
- [x] 3.2 Add `Tick ms: <n>` display bound to `autoplayIntervalMs` and keep existing controls (Step, Autoplay/Pause, Reset, selector, highlights) functional.

## 4. Verification

- [ ] 4.1 Manually verify scenarios: default 1000 ms autoplay cadence, speed-up/slow-down clamping, and pause/resume behavior.
- [x] 4.2 Run project checks (`npm run build` or configured validation) to confirm no regressions from UI/control changes.
