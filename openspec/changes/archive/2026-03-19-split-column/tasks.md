## 1. Tipos de dominio

- [ ] 1.1 Agregar `splitGroup?: string` y `splitRole?: "doing" | "ready"` al tipo `Status` en `src/domain/types.ts`

## 2. Expansión en config loader

- [ ] 2.1 Agregar `split?: boolean` al tipo `RawStatus` en `src/config/defaultConfig.ts`
- [ ] 2.2 Crear función `expandSplitStatuses(statuses: RawStatus[]): RawStatus[]` (o inline en `buildWorkflow`) que, para cada status con `split: true`, inserta dos entradas: `<id>-doing` (con wipLimit original, splitGroup, splitRole: "doing") y `<id>-ready` (sin wipLimit, splitGroup, splitRole: "ready")
- [ ] 2.3 Reasignar los `order` secuencialmente (1, 2, 3…) después de la expansión para que el engine los reciba en orden continuo
- [ ] 2.4 Propagar `splitGroup` y `splitRole` a través de `assignCategory` y `buildWorkflow` hasta el tipo `Status` resultante

## 3. Componente SplitColumn

- [ ] 3.1 Crear `src/components/SplitColumn.tsx` con props `{ doingStatus: Status, readyStatus: Status, doingItems: Workitem[], readyItems: Workitem[], highlightMode: HighlightMode }`
- [ ] 3.2 Renderizar un contenedor flex-column: encabezado con el nombre del proceso (de `doingStatus.name`), y debajo un flex-row con dos `<Column>` side-by-side separadas por un divisor vertical de 1px
- [ ] 3.3 El encabezado de cada sub-columna muestra la etiqueta ("Doing" o "Ready") y, solo en Doing, el indicador WIP `[n/limit]` si aplica

## 4. Board — agrupación de columnas split

- [ ] 4.1 En `src/components/Board.tsx`, antes de renderizar, agrupar `workflow.statuses` en unidades visuales: pares con mismo `splitGroup` se convierten en un grupo "split", el resto son columnas simples
- [ ] 4.2 Renderizar grupos split con `<SplitColumn>` y columnas simples con `<Column>` (comportamiento actual sin cambios)

## 5. Demo en defaultConfig.json

- [ ] 5.1 Añadir `"split": true` a dos o tres statuses intermedios de la simulación "SDF workflows" en `src/config/defaultConfig.json` para demostrar la feature visualmente
