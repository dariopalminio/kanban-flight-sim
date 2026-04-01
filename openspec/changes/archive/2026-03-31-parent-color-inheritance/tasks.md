## 1. Tipo Workitem

- [x] 1.1 Añadir `color: string` al tipo `Workitem` en `src/domain/types.ts`

## 2. Paleta y asignación en el motor

- [x] 2.1 Definir la constante `WORKITEM_PALETTE: string[]` en `src/simulation/engine.ts` con los 10 colores de la paleta (`#e74c3c`, `#e67e22`, `#f1c40f`, `#2ecc71`, `#1abc9c`, `#3498db`, `#9b59b6`, `#e91e63`, `#00bcd4`, `#ff9800`).
- [x] 2.2 En `buildInitialState`, asignar `color: WORKITEM_PALETTE[i % WORKITEM_PALETTE.length]` a cada ítem L3, donde `i` es el índice 0-based en el array inicial.
- [x] 2.3 En `tick()` Paso 8 (inyección de demanda), asignar `color: WORKITEM_PALETTE[(newCounters.L3 - 1) % WORKITEM_PALETTE.length]` al nuevo ítem L3.
- [x] 2.4 En Paso 3 (creación de `newL0Children`), heredar `color: w.color` del ítem L1 padre.
- [x] 2.5 En Paso 5 (creación de `newL1Children`), heredar `color: w.color` del ítem L2 padre.
- [x] 2.6 En Paso 7 (creación de `newL2Children`), heredar `color: w.color` del ítem L3 padre.

## 3. Componente Card

- [x] 3.1 En `Card.tsx`, reemplazar `LEVEL_COLORS[item.level]` por `item.color` como valor de `background`.
- [x] 3.2 Eliminar la constante `LEVEL_COLORS` de `Card.tsx`.

## 4. Verificación

- [x] 4.1 Compilar el proyecto (`npm run build`) sin errores de TypeScript.
- [x] 4.2 Verificar en el navegador que cada árbol familiar comparte el mismo color de tarjeta en todos los niveles.
