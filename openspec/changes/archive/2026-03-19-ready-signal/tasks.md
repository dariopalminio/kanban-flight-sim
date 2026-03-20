## 1. Tipos de dominio

- [x] 1.1 Agregar `hasReadySignal?: boolean` al tipo `Status` en `src/domain/types.ts`
- [x] 1.2 Agregar `isReady?: boolean` al tipo `Workitem` en `src/domain/types.ts`

## 2. Config loader

- [x] 2.1 Agregar `hasReadySignal?: boolean` al tipo `RawStatus` en `src/config/defaultConfig.ts` y propagarlo en `assignCategory` / `buildWorkflow` para que aparezca en el `Status` resultante

## 3. Engine — lógica de dos fases

- [x] 3.1 Extraer helper `advanceOrSignal(item, wf, wipFn, prob)` en `engine.ts`: si el status del ítem tiene `hasReadySignal` y `!item.isReady`, hace el draw y devuelve `{ ...item, isReady: true }` sin cambiar statusId; si `isReady` es true, hace el draw + WIP y avanza normalmente limpiando `isReady`
- [x] 3.2 Usar `advanceOrSignal` en Step 1 (L0 autónomo) reemplazando el bloque de avance actual para ítems en statuses con `hasReadySignal`
- [x] 3.3 Usar `advanceOrSignal` en Step 3 (L1) para el avance probabilístico (excluyendo la lógica de commitment point y first-downstream blocking que no aplica aquí)
- [x] 3.4 Usar `advanceOrSignal` en Step 5 (L2) de forma simétrica
- [x] 3.5 Usar `advanceOrSignal` en Step 7 (L3) de forma simétrica

## 4. Card — indicador visual

- [x] 4.1 En `src/components/Card.tsx`, mostrar un `✓` en color `#22c55e` (posicionado en la esquina inferior derecha de la tarjeta con `position: absolute` o como elemento inline) cuando `item.isReady === true`

## 5. Demo en defaultConfig.json

- [x] 5.1 Añadir `"hasReadySignal": true` a dos o tres statuses intermedios de la simulación "SDF workflows" en `src/config/defaultConfig.json`
