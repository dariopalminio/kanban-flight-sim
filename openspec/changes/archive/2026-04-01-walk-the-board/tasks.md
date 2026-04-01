## 1. Step 1 — L0 right-to-left advancement (engine.ts)

- [x] 1.1 En `engine.ts` PASO 1: reemplazar la construcción de `l0Fronts` + `items.map()` por un loop sobre columnas L0 ordenadas descendentemente por `status.order`
- [x] 1.2 Dentro del loop: identificar el front-of-queue del column actual, y si existe, reasignar `items` avanzando solo ese ítem vía `advanceOrSignal`
- [x] 1.3 Verificar que el `wipL0` tracker (ya inicializado antes del loop) se comparte entre todas las iteraciones del loop sin reinicialización

## 2. Step 3 — L1 general block right-to-left (engine.ts)

- [x] 2.1 En `engine.ts` PASO 3: extraer el bloque "General advancement" (actualmente al final del `items.map()` de L1) en un loop separado sobre columnas L1 generales ordenadas descendentemente
- [x] 2.2 Definir "columnas L1 generales" como las columnas con items L1 cuyo `order` no sea `firstDownstreamOrder`, `secondDownstreamOrder`, ni `deliveryOrder`
- [x] 2.3 Mantener sin cambios el sub-bloque `firstDownstream` y `secondDownstream` dentro del `items.map()` de PASO 3 (estos siguen siendo paralelos)
- [x] 2.4 Asegurar que `newL0Children` sigue acumulándose correctamente dentro del loop derecha-a-izquierda cuando el ítem cruza el commitment point

## 3. Step 5 — L2 general block right-to-left (engine.ts)

- [x] 3.1 Aplicar el mismo patrón que la tarea 2.x al bloque de avance general de PASO 5 (L2): loop derecha-a-izquierda sobre columnas L2 generales
- [x] 3.2 Verificar que `newL1Children` se acumula correctamente dentro del loop cuando un L2 cruza commitment

## 4. Step 7 — L3 general block right-to-left (engine.ts)

- [x] 4.1 Aplicar el mismo patrón al bloque de avance general de PASO 7 (L3): loop derecha-a-izquierda sobre columnas L3 generales
- [x] 4.2 Verificar que `newL2Children` se acumula correctamente dentro del loop cuando un L3 cruza commitment

## 5. Verificación manual

- [x] 5.1 Correr la simulación "Simplified" (4 columnas por nivel) y confirmar que ítems pueden cascadar dos columnas en un tick cuando la columna destino se libera
- [x] 5.2 Correr la simulación "SDF workflows" (7-10 columnas por nivel) y confirmar que no hay errores de TypeScript ni runtime
- [x] 5.3 Verificar que WIP limits siguen respetándose: un ítem no puede entrar a una columna llena aunque el tick lo procese en orden favorable
