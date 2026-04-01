## Context

El motor actual (Pasos 1–7 en `engine.ts`) procesa todos los ítems de un nivel con `items.map(...)` y aplica `maybe(advanceProbability)` de forma independiente a cada ítem. Esto permite que un ítem que llegó después a una columna avance antes que uno que llegó antes, violando FIFO.

La visualización en `Board.tsx` filtra ítems con `items.filter(w => w.statusId === status.id)`, que preserva el orden del array. Como los ítems se crean en secuencia y se añaden al final del array, el orden de creación ya es correcto en pantalla. Pero el orden dentro de una columna no refleja necesariamente el orden de llegada a esa columna específica (un ítem puede ser trasladado desde una columna diferente en un tick posterior).

## Goals / Non-Goals

**Goals:**
- FIFO estricto: dentro de cada columna, el ítem que llegó primero es el único que puede avanzar hasta que salga de esa columna.
- Visualización FIFO: ítems ordenados por `enteredAt` ascendente (más antiguo arriba) dentro de cada columna.
- Mantener el contrato de función pura de `tick()`.
- Sin cambios en la configuración JSON.

**Non-Goals:**
- No se añade buffer de "salida" ni posiciones físicas dentro de la columna.
- No se modifica la lógica de WIP limits (sigue siendo responsabilidad de `makeWipTracker`).
- No se cambia la lógica jerárquica de bloqueo padre-hijo (Pasos 2–7).

## Decisions

### 1. `enteredAt: number` en `Workitem` (no una estructura separada)

El tick de llegada se almacena directamente en el `Workitem`. Alternativa descartada: mapa externo `statusId → tick` por ítem. Añadir el campo al tipo es más simple, no requiere estructuras adicionales en `SimState`, y el motor ya crea copias inmutables de los ítems en cada transición.

### 2. FIFO estricto: solo el ítem frontal puede avanzar

Dentro de cada columna (agrupado por `statusId`), se identifica el ítem con el menor `enteredAt` como el "frente de la cola". Solo ese ítem es elegible para el chequeo de probabilidad y WIP. Los demás se retornan sin cambios.

**Alternativa descartada**: FIFO por prioridad (todos los ítems se evalúan pero en orden, y el primero que supera el chequeo gana). Requiere más coordinación entre ítems y puede resultar en el mismo efecto con mayor complejidad.

**Consecuencia de esta decisión**: En Pasos 1, 3, 5 y 7, la lógica de avance cambia de `map` genérico a un map que, por columna, solo permite que avance el ítem frontal. Los pasos "push" (2, 4, 6) no aplican FIFO porque son transiciones automáticas sin elección: el ítem se mueve cuando su condición se cumple.

### 3. `enteredAt` se asigna en toda transición de `statusId`

Cada vez que un ítem cambia de `statusId` (en cualquier paso), se le asigna `enteredAt: currentTick`. `buildInitialState` usa `enteredAt: 0`.

### 4. Ordenamiento en `Column.tsx`, no en `Board.tsx`

El sort de visualización se realiza en `Column.tsx` justo antes del render, con `[...items].sort((a, b) => a.enteredAt - b.enteredAt)`. Así el sort es local a la columna y no modifica el array de estado original.

## Risks / Trade-offs

- **[Riesgo] Simulación más lenta** → Con FIFO estricto, una columna con varios ítems solo drena de a uno por vez (el frente). Con WIP alto y advanceProbability bajo esto puede ser muy lento. Mitigación: es el comportamiento esperado de una cola FIFO real; el usuario puede aumentar `advanceProbability`.
- **[Riesgo] Interacción con bloqueos jerárquicos** → Un ítem en el frente de la cola puede estar bloqueado por reglas de padre-hijo (e.g., esperando que sus hijos terminen). En ese caso, ningún otro ítem detrás puede avanzar aunque esté listo. Esto es correcto: en una cola FIFO real tampoco se puede saltar a alguien bloqueado en la fila.
- **[Trade-off] `enteredAt` en Workitem aumenta el tamaño del estado** → Mínimo impacto para una SPA educativa sin persistencia.
