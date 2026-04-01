## 1. Tipo Workitem

- [x] 1.1 Añadir `enteredAt: number` al tipo `Workitem` en `src/domain/types.ts`

## 2. buildInitialState

- [x] 2.1 Inicializar `enteredAt: 0` en todos los ítems creados por `buildInitialState` en `src/simulation/engine.ts`

## 3. Asignación de enteredAt en transiciones

- [x] 3.1 En `advanceOrSignal`, al retornar el ítem con nuevo `statusId`, incluir `enteredAt: currentTick`. Requiere pasar `currentTick` como parámetro a `advanceOrSignal`.
- [x] 3.2 En todos los bloques donde se construye un ítem con `statusId: keysLx.firstDownstreamId` (push steps y bloques inline), añadir `enteredAt: currentTick`.
- [x] 3.3 En todos los bloques donde `getNextStatusId` produce un nuevo `statusId` (pasos de avance jerárquico), añadir `enteredAt: currentTick`.
- [x] 3.4 En la creación de hijos (`newL0Children`, `newL1Children`, `newL2Children`), inicializar `enteredAt: currentTick`.
- [x] 3.5 En la inyección de demanda (Paso 8), inicializar `enteredAt: currentTick`.

## 4. Política FIFO en el motor

- [x] 4.1 Crear helper `frontOfQueue(items: Workitem[], statusId: string): string | undefined` que retorna el `id` del ítem con menor `enteredAt` en la columna dada (tie-break: posición en array).
- [x] 4.2 En Paso 1 (avance L0 autónomo), aplicar FIFO: por cada `statusId` distinto de L0, solo el ítem al frente puede avanzar; los demás retornan sin cambios.
- [x] 4.3 En Paso 3 (avance L1), aplicar FIFO al bloque de avance general (statuses que no son firstDownstream ni secondDownstream).
- [x] 4.4 En Paso 5 (avance L2), aplicar la misma lógica FIFO que en 4.3.
- [x] 4.5 En Paso 7 (avance L3), aplicar la misma lógica FIFO que en 4.3.

## 5. Visualización FIFO en Column.tsx

- [x] 5.1 En `Column.tsx`, ordenar los ítems por `enteredAt` ascendente antes del render: `[...items].sort((a, b) => a.enteredAt - b.enteredAt)`.

## 6. Verificación

- [x] 6.1 Compilar el proyecto (`npm run build`) sin errores de TypeScript.
- [x] 6.2 Verificar en el navegador: con `initialReleaseCount > 1`, los ítems aparecen en orden de creación (más antiguo arriba) en la columna inicial.
- [x] 6.3 Verificar en el navegador: al avanzar ticks, los ítems avanzan en orden FIFO (el ítem más antiguo en una columna sale primero).
