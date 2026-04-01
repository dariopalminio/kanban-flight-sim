## Why

El simulador actualmente selecciona ítems de forma aleatoria dentro de cada columna, lo que permite que un ítem ingresado después avance antes que uno ingresado anteriormente. Esto no refleja el comportamiento de una cola FIFO que es fundamental en los sistemas Kanban reales.

## What Changes

- Añadir el campo `enteredAt: number` al tipo `Workitem` para registrar el tick en que el ítem ingresó a su columna actual.
- **BREAKING**: El motor de simulación cambia su política de avance: dentro de cada columna, solo el ítem en la posición frontal de la cola (el que ingresó primero, menor `enteredAt`) puede avanzar a la siguiente columna. Los ítems que están detrás no pueden saltar al frente.
- Los componentes de visualización ordenan los ítems dentro de cada columna por `enteredAt` ascendente (más antiguo arriba, más nuevo abajo).
- `buildInitialState` asigna `enteredAt: 0` a los ítems iniciales.

## Capabilities

### New Capabilities

- `fifo-column-queues`: Comportamiento FIFO estricto en todas las columnas del tablero: orden de visualización por llegada (más antiguo arriba) y política de avance que impide que ítems posteriores salten a los anteriores en la misma columna.

### Modified Capabilities

- `simulation-engine`: La política de avance del motor cambia — dentro de cada columna, solo el ítem al frente de la cola puede avanzar. Requiere el nuevo campo `enteredAt` en `Workitem`.
- `kanban-board-ui`: Los ítems dentro de cada columna se muestran ordenados por `enteredAt` ascendente.

## Impact

- `src/domain/types.ts`: `Workitem` añade `enteredAt: number`.
- `src/simulation/engine.ts`: `buildInitialState` inicializa `enteredAt: 0`. La función `tick` asigna `enteredAt: currentTick` en cada transición y cambia la lógica de selección de ítems a avanzar para respetar el orden FIFO por columna.
- `src/components/Column.tsx` o `Board.tsx`: Ordenar los ítems por `enteredAt` antes de renderizar.
- Sin cambios en la configuración JSON, ni en el tipo `Status`, ni en `Config`.
