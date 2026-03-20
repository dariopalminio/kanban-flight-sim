## Context

La simulación actual tiene un modelo de status plano: cada columna del board corresponde exactamente a un `Status` en el workflow. El engine opera sobre `statusId` de cada workitem. El componente `Board.tsx` itera los statuses del workflow y renderiza un `Column.tsx` por cada uno.

La feature de split column introduce la idea de que dos statuses consecutivos (`<id>-doing` y `<id>-ready`) son presentados visualmente como una sola columna compuesta. La clave de diseño es **dónde** absorber esta dualidad: lo más tarde posible (UI) y lo más cerca de la carga de datos (config).

## Goals / Non-Goals

**Goals:**
- El engine no cambia. Ve dos statuses normales; no sabe nada de splits.
- La expansión ocurre en `buildWorkflow` dentro de `defaultConfig.ts` — un solo lugar.
- La UI agrupa automáticamente los dos statuses expandidos bajo un único encabezado visual.
- El WIP limit del JSON se aplica solo a la sub-columna Doing.
- La feature es retrocompatible: simulaciones sin `split` funcionan exactamente igual.

**Non-Goals:**
- Labels configurables para "Doing" / "Ready" (se usan como constantes fijas en esta versión).
- Soporte de split en el status `isBeforeCommitmentPoint` (el punto de compromiso no se puede dividir en esta versión — complejidad innecesaria).
- Más de dos sub-columnas.

## Decisions

### Decisión 1: Expansión en `buildWorkflow`, no en el engine

El engine opera sobre `statusId` de los workitems y sobre los `statuses[]` del workflow. Si la expansión ocurre en `buildWorkflow` (config loader), el engine recibe un workflow con dos statuses donde antes había uno, y no necesita ningún cambio.

**Alternativa descartada:** Manejar el split dentro del engine con un `subState` en `Workitem`. Esto requiere tocar el tipo `Workitem`, la lógica de `tick()`, `getNextStatusId()`, y el WIP tracker — demasiada invasión para algo que es esencialmente de presentación.

**Cómo se expande:**

```
JSON status: { id: "analysis", name: "Análisis", order: 3, wipLimit: 2, split: true }

Resultado:
  { id: "analysis-doing", name: "Análisis", order: 3, wipLimit: 2, splitGroup: "analysis", splitRole: "doing" }
  { id: "analysis-ready", name: "Análisis", order: 4, splitGroup: "analysis", splitRole: "ready" }
```

Los statuses siguientes en el workflow tienen sus `order` incrementados en 1 por cada split que ocurre antes de ellos.

### Decisión 2: Campo `splitGroup` en `Status` para la UI

Para que el board agrupe los dos sub-statuses en una columna visual, `Status` expone `splitGroup?: string` y `splitRole?: "doing" | "ready"`. El board usa `splitGroup` para agrupar antes de renderizar.

**Alternativa descartada:** Inferir el agrupamiento por convención de nombre (`id.endsWith("-doing")`). Más frágil y acoplado a la naming convention de expansión.

### Decisión 3: Nuevo componente `SplitColumn.tsx`

El Board renderiza:
- Columnas simples: `<Column status={s} ... />`
- Columnas split: `<SplitColumn doingStatus={s1} readyStatus={s2} workitems={...} highlightMode={...} />`

`SplitColumn` es un contenedor flex-row que muestra el nombre del proceso arriba, y debajo dos `Column` side-by-side. La separación visual usa un divisor o borde entre las dos sub-columnas.

**Alternativa descartada:** Modificar `Column.tsx` para soportar el modo split internamente. Mezclaría responsabilidades: Column ya tiene su lógica de header, cards y highlight modes.

### Decisión 4: WIP limit solo en Doing

La sub-columna `<id>-doing` hereda el `wipLimit` del status original. La sub-columna `<id>-ready` no tiene `wipLimit` (es un buffer sin límite). El WIP tracker del engine respeta esto automáticamente porque opera sobre los statuses expandidos.

### Decisión 5: Demo en `defaultConfig.json`

Se añade `"split": true` a statuses del segundo nivel de la simulación "SDF workflows", que ya tiene flujos complejos apropiados para mostrar la feature. Alternativamente se puede agregar una tercera simulación "Split Demo". **Decisión: modificar "SDF workflows"** para no inflar el JSON.

## Risks / Trade-offs

- [Riesgo] Los orders reordenados al expandir split statuses podrían afectar las funciones del engine que usan `order` para comparaciones (`getOrder`, `getNextStatusId`). → Mitigación: los orders son asignados secuencialmente en la expansión; el engine solo compara orders relativos (n vs n+1), no valores absolutos.
- [Trade-off] El `splitGroup` en `Status` es información de presentación en un tipo de dominio. → Aceptado: es opcional (`?`) y el engine nunca lo lee.
- [Riesgo] Si `isBeforeCommitmentPoint` está en el status `<id>-doing`, el engine apunta a `firstDownstreamId` que ya no es `<id>-doing` sino un status real. El `getWfKeys` busca `firstDownstream` como el primer status con `streamType: "DOWNSTREAM"`, lo que funciona correctamente después de la expansión. → Sin problema.
