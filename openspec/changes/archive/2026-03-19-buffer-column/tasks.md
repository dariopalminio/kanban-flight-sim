## 1. Tipos de dominio

- [x] 1.1 Agregar `isBuffer?: boolean` al tipo `Status` en `src/domain/types.ts`

## 2. Column — indicador visual de buffer

- [x] 2.1 En `src/components/Column.tsx`, añadir `borderTop: "2px solid #22c55e"` al contenedor de la columna cuando `status.isBuffer === true` (sin cambiar nada en columnas normales)
- [x] 2.2 En el header de `Column.tsx`, añadir un `✓` en verde (`#22c55e`) tras el nombre del status cuando `status.isBuffer === true`
- [x] 2.3 Pasar `isBuffer={status.isBuffer}` como prop a cada `<Card>` renderizada dentro de la columna

## 3. Card — suprimir check individual en buffers

- [x] 3.1 Añadir prop `isBuffer?: boolean` al tipo `Props` de `src/components/Card.tsx`
- [x] 3.2 Suprimir el badge ✓, el `borderLeft` verde y el `boxShadow` verde cuando `isBuffer === true`, independientemente del valor de `item.isReady`

## 4. Demo en defaultConfig.json

- [x] 4.1 Añadir `"isBuffer": true` a los statuses buffer de "Simple workflows": primer status de cada nivel (L3: `project-todo`, L2: primer upstream de Epic, L1: primer upstream de Story, L0: primer upstream de Task)
- [x] 4.2 Añadir `"isBuffer": true` a los statuses buffer de "SDF workflows": `initiative-funnel` (L3), `feat-pending` (L1), `spec-todo` (L0)
