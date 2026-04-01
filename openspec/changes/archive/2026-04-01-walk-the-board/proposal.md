## Why

El algoritmo actual avanza todos los ítems del frente de cola de todas las columnas en paralelo (push). Esto no refleja la práctica Lean de "caminar el tablero", donde se prioriza liberar lo que está más cerca de Done antes de mover lo que está más lejos, generando un sistema pull genuino.

## What Changes

- El avance de ítems en cada nivel (L0 general, L1 general, L2 general, L3 general) dejará de ser paralelo para convertirse en secuencial de derecha a izquierda (orden descendente de columnas).
- Al procesar columna por columna de derecha a izquierda, cada columna ve el estado actualizado de la columna que tiene a la derecha: si hay espacio libre porque el ítem de la derecha ya avanzó en ese mismo tick, la columna de la izquierda puede ocuparlo.
- El FIFO existente (frente de cola por `enteredAt`) se mantiene sin cambios.
- El WIP tracker mutable existente ya soporta esto sin modificaciones.
- Los pasos especiales (push a firstDownstream, lógica de secondDownstream) no cambian.

## Capabilities

### New Capabilities

- `walk-the-board`: Avance de ítems de derecha a izquierda en cada tick, creando un sistema pull donde las columnas más cercanas a Done tienen prioridad de movimiento.

### Modified Capabilities

- `simulation-engine`: El comportamiento de avance general cambia de paralelo a pull (derecha a izquierda). Cambia el resultado observable de la simulación.
- `fifo-column-queues`: El FIFO se mantiene, pero ahora el procesamiento de columnas tiene un orden definido (derecha a izquierda).

## Impact

- `src/simulation/engine.ts`: 4 bloques de avance general (PASO 1 para L0, bloque general de PASO 3 para L1, PASO 5 para L2, PASO 7 para L3) cambian de `items.map()` paralelo a loop secuencial por columna ordenado descendentemente.
- Sin cambios en tipos, configuración, componentes UI ni config JSON.
- Sin nuevas dependencias.
