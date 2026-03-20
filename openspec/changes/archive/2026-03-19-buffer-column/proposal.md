## Why

En Kanban, algunas columnas son buffers por naturaleza: "Backlog", "Pending", "Selected", "TODO" — su propia existencia señaliza que todo lo que hay ahí está listo para ser jalado. Con la feature de `hasReadySignal` ya implementada, los ítems individuales pueden señalizar readiness dentro de una columna de trabajo. Pero para columnas buffer, poner un check en cada tarjeta es redundante: si la columna completa es un buffer, la señal pertenece a la columna, no a la tarjeta.

Regla de oro: **"Una columna buffer no necesita checks individuales; su propia existencia es la señal de ready."**

Esto completa el sistema pull de la simulación:
- `isBuffer: true` → toda la columna es ready; el check visual está en el encabezado de la columna.
- `hasReadySignal: true` → columna de trabajo donde los ítems se vuelven ready uno a uno; el check está en cada tarjeta.

## What Changes

- Se agrega campo opcional `"isBuffer": true` en la definición de un `status` en `defaultConfig.json`.
- `Column.tsx` muestra un indicador visual (✓ verde) en el **encabezado de la columna** cuando `status.isBuffer === true`.
- Las tarjetas en columnas buffer NO muestran checks individuales — la señal es de la columna, no de la tarjeta.
- El engine no cambia: los ítems en columnas buffer avanzan con la probabilidad normal. La semántica de "pullable" es informativa para la visualización, no para la mecánica de avance.
- Se marcan como `isBuffer: true` los statuses apropiados en los workflows existentes (Pending, Funnel, Todo, etc.).

## Capabilities

### New Capabilities
- `buffer-column`: Campo `isBuffer` en status, indicador visual en encabezado de columna, supresión de checks individuales en tarjetas dentro de buffer.

### Modified Capabilities
- `simulation-configuration`: El tipo `Status` acepta `isBuffer?: boolean` como campo opcional.
- `kanban-board-ui`: El encabezado de columna muestra un indicador de buffer cuando `status.isBuffer === true`. Las tarjetas en buffer suprimen el check individual.

## Impact

- `src/domain/types.ts`: `isBuffer?: boolean` en `Status`.
- `src/config/defaultConfig.ts`: propagación automática via `RawStatus` (mismo patrón que `hasReadySignal`).
- `src/components/Column.tsx`: indicador ✓ verde en el header cuando `isBuffer`.
- `src/components/Card.tsx`: suprimir `isReady` visual cuando el status de la tarjeta es buffer (la columna ya señaliza).
- `src/config/defaultConfig.json`: añadir `isBuffer: true` a statuses de tipo buffer en ambas simulaciones.
- No hay cambios en `engine.ts`, `Board.tsx` ni en la lógica de simulación.
