## Why

En Kanban, un elemento "terminado" en una etapa no es lo mismo que un elemento "jalado" por la siguiente. Actualmente la simulación no distingue estos dos momentos: cuando un ítem avanza, pasa directamente al siguiente estado sin señalizar que está listo para ser jalado. Esto impide visualizar el buffer de demanda entre etapas.

Mozilla implementó exactamente este patrón: las tarjetas se marcan con un **check verde** cuando están listas para el siguiente proceso, sin necesidad de columnas "Ready" adicionales. Esta señal es suficiente para comunicar el estado de pull y es una solución documentada en práctica real de Kanban.

## What Changes

- Se agrega campo opcional `"hasReadySignal": true` en la definición de un `status` en `defaultConfig.json`.
- Se agrega campo `isReady?: boolean` en el tipo `Workitem`.
- El engine modifica el avance de ítems en statuses con `hasReadySignal`: primero el ítem se marca `isReady: true` (probabilístico, mismo tick que cualquier avance), luego en un tick posterior avanza al siguiente status. El WIP limit sigue aplicándose al status completo.
- `Card.tsx` muestra un **check verde (✓)** cuando `item.isReady === true`.
- Se agrega `"hasReadySignal": true` a statuses apropiados en la simulación "SDF workflows" para demostrar la feature.

## Capabilities

### New Capabilities
- `ready-signal`: Campo `hasReadySignal` en status, lógica de dos fases en el engine, y señal visual en la tarjeta.

### Modified Capabilities
- `simulation-configuration`: El tipo `Status` acepta `hasReadySignal?: boolean` como campo opcional.
- `simulation-engine`: El avance de ítems en statuses con `hasReadySignal` se convierte en dos fases: marcar ready (probabilístico) → avanzar (probabilístico tick siguiente).

## Impact

- `src/domain/types.ts`: `isReady?: boolean` en `Workitem`; `hasReadySignal?: boolean` en `Status`.
- `src/simulation/engine.ts`: Lógica de dos fases en Steps 1, 3, 5, 7.
- `src/components/Card.tsx`: Indicador visual ✓ verde cuando `isReady`.
- `src/config/defaultConfig.ts`: Propagar `hasReadySignal` al cargar statuses.
- `src/config/defaultConfig.json`: Añadir `hasReadySignal: true` a statuses en "SDF workflows".
- No hay cambios en `Board.tsx`, `Column.tsx` ni en la estructura de workflows.
