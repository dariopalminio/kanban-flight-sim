## Why

La simulacion tiene Autoplay fijo a 1000 ms por tick, lo que limita la exploracion: en algunos escenarios es demasiado lenta para observar flujo global y en otros demasiado rapida para analizar transiciones. Habilitar control de velocidad permite ajustar el ritmo de aprendizaje sin cambiar codigo.

## What Changes

- Add a simulation speed control in the header to increase or decrease autoplay tick interval in milliseconds.
- Replace the fixed autoplay interval with a user-adjustable interval state used by the autoplay effect.
- Display the current autoplay interval (`Tick ms`) so users can see the active speed.
- Keep existing Step, Pause/Autoplay, Reset, simulation selector, and highlight controls behavior unchanged.
- Define sensible min/max bounds and step increments to prevent invalid or unusable speeds.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `simulation-controls`: Extend control requirements so autoplay interval is configurable at runtime (faster/slower) instead of fixed at 1000 ms.

## Impact

- Affected code:
  - `src/App.tsx` (control state, UI controls, autoplay interval source)
- No backend, API, or dependency changes.
- Small UX extension in the header controls area.
