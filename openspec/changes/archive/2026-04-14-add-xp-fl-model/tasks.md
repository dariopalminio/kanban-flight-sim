## 1. Crear el archivo del modelo

- [x] 1.1 Crear `src/config/models/xp-fl-workflows.json` con los parámetros de simulación (`name`, `initialReleaseCount: 3`, `advanceProbability: 0.5`, `childrenPerParent: 3`, `demandInterval: 0`)
- [x] 1.2 Agregar workflow L3 "Initiative" con 6 estados: Options (UPSTREAM, commitment, hasReadySignal) → Exploration (DOWNSTREAM, buffer) → Active → Steering → Measuring → Sustained/Stopped (delivery)
- [x] 1.3 Agregar workflow L2 "Release-Epic" con 5 estados: Release-Plan (UPSTREAM, commitment, hasReadySignal) → Selected (DOWNSTREAM, buffer) → In-Progress → Validating&Acceptance → Released (delivery)
- [x] 1.4 Agregar workflow L1 "User-Story" con 6 estados: Options (UPSTREAM) → Iteration-Plan (UPSTREAM, commitment, hasReadySignal) → Committed (DOWNSTREAM, buffer) → Iteration-In-Progress → Acceptance → Done (delivery)
- [x] 1.5 Agregar workflow L0 "Task" con 4 estados: Backlog (UPSTREAM, commitment) → Ready (DOWNSTREAM, buffer) → In-Progress → Done (delivery)

## 2. Verificación

- [x] 2.1 Validar que el JSON es sintácticamente correcto y que cada workflow tiene exactamente un `isBeforeCommitmentPoint: true` y un `isPosDeliveryPoint: true`
- [x] 2.2 Ejecutar `npm run build` y verificar que compila sin errores
- [x] 2.3 Verificar en `npm run dev` que "XP-FL Workflows" aparece en el selector y la simulación corre sin errores en consola
