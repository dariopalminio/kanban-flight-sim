## Why

En simulaciones largas las columnas Done acumulan decenas de tarjetas, haciendo que cada tablero crezca verticalmente de forma ilimitada. Limitar la altura visible y habilitar scroll en las columnas Done mejora significativamente la legibilidad del tablero sin ocultar información.

## What Changes

- Las columnas cuyo `statusCategory` sea `DONE` mostrarán scroll vertical interno cuando contengan más de N tarjetas (N definido como constante `DONE_COLUMN_SCROLL_THRESHOLD`).
- Por debajo del umbral el comportamiento es idéntico al actual (sin restricción de altura).

## Capabilities

### New Capabilities

<!-- Sin capacidades nuevas -->

### Modified Capabilities

- `kanban-board-ui`: Se agrega el requisito de overflow scroll en columnas Done cuando superan el umbral de tarjetas configurable por constante.

## Impact

- `src/components/Column.tsx`: aplicar `overflowY: "auto"` y `maxHeight` calculada cuando `status.statusCategory === "DONE"` e `items.length > DONE_COLUMN_SCROLL_THRESHOLD`.
- No hay cambios en engine, tipos, configuración ni otros componentes.
