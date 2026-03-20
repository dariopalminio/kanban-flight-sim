## Why

En Kanban, muchos procesos se benefician de dividir visualmente una columna en dos sub-columnas: **Doing** (trabajo activo, WIP-limitado) y **Ready** (buffer de salida, ilimitado). Actualmente la simulación solo soporta columnas simples, lo que impide representar este patrón fundamental de flujo que separa "estoy haciendo esto" de "terminé y espero ser jalado al siguiente proceso".

## What Changes

- Se agrega campo opcional `"split": true` en la definición de un status en `defaultConfig.json`.
- Al cargar la config, cada status con `split: true` se expande en dos statuses reales: `<id>-doing` y `<id>-ready`. El engine no cambia — ve dos statuses normales.
- En la UI, los dos statuses del split se agrupan bajo un único encabezado visual con dos sub-columnas: **Doing** (izquierda, con WIP limit) y **Ready** (derecha, sin WIP limit).
- Se añade un simulation de ejemplo que usa split columns para demostrar la feature.
- El WIP limit definido en el JSON se aplica únicamente a la sub-columna Doing. Ready es un buffer sin límite.

## Capabilities

### New Capabilities
- `split-column`: Definición, expansión y renderizado de columnas split (Doing | Ready) — configuración en JSON, expansión en `defaultConfig.ts`, y componente `SplitColumn` en la UI.

### Modified Capabilities
- `simulation-configuration`: El tipo `Status` en el JSON acepta un nuevo campo opcional `split: boolean`. Cualquier status con `split: true` genera dos sub-statuses en la config cargada.
- `kanban-board-ui`: El Board agrupa statuses con `splitGroup` y renderiza un contenedor visual split en lugar de dos columnas independientes.

## Impact

- `src/domain/types.ts`: Dos campos nuevos opcionales en `Status`: `splitGroup?: string`, `splitRole?: "doing" | "ready"`.
- `src/config/defaultConfig.ts`: `buildWorkflow` expande statuses con `split: true` en dos entradas.
- `src/components/Board.tsx`: Agrupa statuses por `splitGroup` al renderizar columnas.
- `src/components/SplitColumn.tsx`: Nuevo componente para el contenedor visual de dos sub-columnas.
- `src/config/defaultConfig.json`: Se añade `"split": true` a statuses apropiados en la simulación "SDF workflows" (o se agrega una nueva simulación de ejemplo).
- No hay cambios en `engine.ts`, `Card.tsx`, ni en la lógica de simulación.
