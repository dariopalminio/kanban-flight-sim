## Why

En la implementación actual, los hijos se crean cuando el padre llega al estado `isBeforeCommitmentPoint`, incluso si el padre no puede avanzar al primer downstream por restricción de WIP. Esto viola el principio del *last responsible moment*: se descompone trabajo que aún no está comprometido, generando desperdicio en el sistema simulado.

## What Changes

- **BREAKING** — La regla de creación de hijos cambia: los hijos ya no se crean mientras el padre está en el estado `isBeforeCommitmentPoint`; se crean en el momento en que el padre entra efectivamente al primer estado downstream.
- El avance del padre desde `isBeforeCommitmentPoint` continúa siendo probabilístico y sujeto a WIP.
- Si el padre no puede avanzar (bloqueado por WIP), no se crean hijos en ese tick.

## Capabilities

### New Capabilities

*(ninguna)*

### Modified Capabilities

- `simulation-engine`: El requisito de creación de hijos en Steps 3, 5 y 7 cambia — el trigger pasa de "estar en `isBeforeCommitmentPoint`" a "entrar al primer downstream".

## Impact

- `src/simulation/engine.ts` — Steps 3, 5 y 7: mover la lógica de spawn de hijos desde el bloque `isBeforeCommitmentPoint` al bloque que detecta la transición hacia `firstDownstreamId`.
- No hay cambios en tipos, configuración JSON, ni componentes UI.
- **Cambio de comportamiento observable**: en simulaciones con WIP activo (ej. "Simplified"), los tableros L0/L1/L2 mostrarán menos items prematuros en upstream.
