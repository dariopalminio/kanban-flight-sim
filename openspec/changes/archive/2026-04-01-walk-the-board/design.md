## Context

El engine actual (Step 1 para L0, bloque general de Step 3 para L1, Step 5 para L2, Step 7 para L3) determina los frentes de cola de todas las columnas en un snapshot inicial y luego avanza todos en un único `items.map()`. Esto equivale a un sistema push donde todas las columnas actúan en paralelo: si la columna N tiene WIP limit lleno, la columna N-1 no puede avanzar aunque la columna N se vacíe en ese mismo tick.

"Caminar el tablero" (walk the board) es la práctica Lean de revisar el tablero de derecha a izquierda para que las columnas más cercanas a Done tengan prioridad de movimiento, creando un sistema pull real.

## Goals / Non-Goals

**Goals:**
- Cambiar el avance general de ítems (Steps 1, 3-general, 5-general, 7-general) a procesamiento secuencial de columnas ordenadas de mayor `order` a menor.
- Mantener el contrato pure-function de `tick()` sin cambios: misma firma, sin side effects, sin mutación del input.
- Mantener el FIFO intra-columna existente (frente de cola por `enteredAt` mínimo).
- Mantener el WIP tracker mutable intra-tick (`makeWipTracker`) sin cambios: ya soporta el nuevo patrón.

**Non-Goals:**
- No cambiar la lógica de los pasos especiales: push a firstDownstream (Steps 2, 4, 6) y lógica de secondDownstream (dentro de Steps 3, 5, 7).
- No cambiar tipos, configuración JSON, componentes UI.
- No introducir configuración para alternar entre push y pull.

## Decisions

### Decisión 1: Loop por columna reemplaza `items.map()` paralelo

**Alternativa descartada**: mantener el `items.map()` pero con un orden de items en el array que priorice columnas de derecha a izquierda. Descartada porque el array de items no tiene un orden garantizado y mezcla niveles.

**Decisión adoptada**: para cada bloque de avance general, reemplazar el patrón:
```
build all fronts at once → single items.map()
```
por:
```
sort columns descending by order → for each column: find front → try advance → reassign items
```

Esto garantiza que cuando el ítem de columna N avanza a N+1 (actualizando el WIP tracker), la columna N-1 ya ve ese espacio libre cuando llega su turno.

### Decisión 2: El WIP tracker no necesita cambios

`makeWipTracker` ya es mutable intra-tick: cada transición aprobada incrementa el contador del destino. Al procesar derecha-a-izquierda secuencialmente, el mismo tracker refleja los movimientos ya realizados en ese tick. No se requiere reinicializarlo entre columnas.

### Decisión 3: `items` se reasigna en cada iteración del loop

Dentro del loop de columnas, `items = items.map(w => w.id !== fid ? w : advanceOrSignal(...))`. Esto es O(n) por columna, resultando en O(c×n) por paso donde c = número de columnas. Para los tamaños de simulación actuales (decenas de ítems, 4-10 columnas por nivel) esto es completamente aceptable.

### Decisión 4: PASO 3/5/7 — solo el bloque general cambia

Los bloques de `firstDownstream` y `secondDownstream` dentro de Steps 3, 5, 7 tienen lógica de dependencia jerárquica (esperan estado de hijos). Estos no se procesan con FIFO general y no forman parte del "caminar el tablero". Se mantienen como están (dentro del `items.map()` de cada paso). Solo el sub-bloque "general advancement" al final de cada paso adopta el loop derecha-a-izquierda.

## Risks / Trade-offs

- **Cambio de comportamiento observable**: la simulación producirá trayectorias diferentes con el nuevo algoritmo. Ítems bloqueados por WIP podrán avanzar en el mismo tick si la columna destino se liberó durante ese tick. Esto es el comportamiento deseado (pull), pero hace que los resultados no sean reproducibles si se comparan con versiones anteriores.
  → Mitigación: el cambio es intencional y documentado. No hay estado persistido que necesite migración.

- **Interacción con `newL0Children` / `newL1Children` / `newL2Children`**: en Steps 3, 5, 7, los hijos creados en el commitment point se acumulan en arrays temporales y se agregan a `items` al final de cada paso. El loop derecha-a-izquierda del bloque general ocurre antes de que se agreguen esos hijos (el commitment point dispara en el bloque general). El orden se mantiene igual al actual.
  → Sin riesgo adicional.
