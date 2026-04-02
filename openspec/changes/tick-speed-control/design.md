## Context

Autoplay currently uses a fixed constant interval of 1000 ms in the root UI component. This makes fast-forward and slow-inspection use cases impossible without code edits. The requested change is UI-scoped and does not alter simulation rules or `tick(state, config)` behavior.

Constraints:
- Keep `tick` pure and unchanged in semantics.
- Keep the current header-control structure and inline style approach.
- Avoid configuration schema changes unless runtime controls cannot satisfy the requirement.

## Goals / Non-Goals

**Goals:**
- Let users increase/decrease autoplay speed directly from controls.
- Represent speed as tick interval in milliseconds and show the current value.
- Enforce safe bounds (min/max) and deterministic step size.
- Preserve existing Step, Pause/Autoplay, Reset, selector, and highlight behavior.

**Non-Goals:**
- Changing any engine logic (Step 1-7 ordering, movement rules, or probability rules).
- Persisting speed preference across page reloads.
- Adding new config fields in `defaultConfig.json`.

## Decisions

1. Store interval in component state (`autoplayIntervalMs`) in `App.tsx`.
- Why: speed is a transient UI control, local to current session.
- Alternative considered: store per-simulation defaults in config JSON. Rejected to avoid schema expansion and migration overhead for a simple interaction control.

2. Replace fixed `AUTOPLAY_INTERVAL_MS` with `autoplayIntervalMs` in the autoplay `useEffect` dependency list.
- Why: changing speed while playing should immediately reconfigure interval with React effect teardown/recreate behavior.
- Alternative considered: keep interval fixed until Pause/Resume. Rejected because users expect immediate speed response.

3. Add two explicit controls: slower (`+step ms`) and faster (`-step ms`) around a displayed current value (`Tick ms: <n>`).
- Why: direct mapping to the user request (increase/decrease speed) and low cognitive load.
- Alternative considered: range slider. Rejected for less precise increments in compact toolbar layout.

4. Clamp interval changes to constants (`MIN=100`, `MAX=5000`, `STEP=100`).
- Why: avoids near-zero intervals that hurt rendering clarity and very large delays that appear broken.
- Alternative considered: unrestricted numeric input. Rejected due to validation complexity and accidental invalid states.

## Risks / Trade-offs

- Very low intervals increase render pressure and can make board motion hard to follow -> Mitigation: enforce minimum and use conservative default/step.
- Additional toolbar controls may reduce space on narrow screens -> Mitigation: keep compact button labels and rely on existing `flexWrap`.
- Users might interpret lower ms as "slower" (inverse relation) -> Mitigation: label buttons as "Faster" and "Slower" instead of only +/-.
