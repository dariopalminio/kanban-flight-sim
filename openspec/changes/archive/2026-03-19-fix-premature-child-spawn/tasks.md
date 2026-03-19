## 1. Engine — Fix child spawn timing (Step 3: L1)

- [x] 1.1 En `engine.ts` Step 3: eliminar el bloque `if (w.statusId === keysL1.commitmentId)` que crea hijos antes del avance del padre
- [x] 1.2 En Step 3: cuando el padre está en `commitmentId`, aplicar primero probabilidad y WIP check; si la transición es aprobada, crear hijos antes de emitir el nuevo statusId
- [x] 1.3 Verificar que la guarda `!hasChildren` siga presente para evitar re-spawn en ticks posteriores

## 2. Engine — Fix child spawn timing (Step 5: L2)

- [x] 2.1 En `engine.ts` Step 5: aplicar el mismo cambio — eliminar spawn en `commitmentId` y moverlo a la transición aprobada hacia `firstDownstreamId`
- [x] 2.2 Verificar guarda `!hasChildren` en Step 5

## 3. Engine — Fix child spawn timing (Step 7: L3)

- [x] 3.1 En `engine.ts` Step 7: aplicar el mismo cambio — eliminar spawn en `commitmentId` y moverlo a la transición aprobada hacia `firstDownstreamId`
- [x] 3.2 Verificar guarda `!hasChildren` en Step 7

## 4. Verificación manual en el simulador

- [x] 4.1 Cargar simulación "Simplified" y confirmar que `EPIC-3` (u otro ítem bloqueado por WIP) no genera Stories mientras permanece en `epic-committed`
- [x] 4.2 Confirmar que al cruzar el WIP limit se crean los hijos en el mismo tick que el padre entra a `In-Progress`
- [x] 4.3 Cargar simulación "SDF workflows" y confirmar comportamiento equivalente en L2→L1 y L3→L2
