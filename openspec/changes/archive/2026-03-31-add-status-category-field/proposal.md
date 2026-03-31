## Why

El campo `statusCategory` se calcula dinámicamente en tiempo de ejecución basándose en la posición del estado y su `streamType`, lo que impide definir explícitamente la categoría desde la configuración. Esto limita la flexibilidad para workflows donde la categoría no se puede inferir automáticamente con precisión.

## What Changes

- Añadir el campo `statusCategory` (`"TODO" | "IN_PROGRESS" | "DONE"`) a cada objeto de estado en el JSON de configuración (`defaultConfig.json`).
- Modificar el cargador de configuración (`defaultConfig.ts`) para usar el valor explícito de `statusCategory` del JSON en lugar de derivarlo automáticamente.
- El modo de highlight `"category"` en `Column.tsx` ya pinta las columnas usando `status.category`; este campo ahora vendrá del JSON directamente.

## Capabilities

### New Capabilities

_Ninguna. No se introduce nueva funcionalidad visible al usuario._

### Modified Capabilities

- `simulation-configuration`: El esquema de configuración del JSON añade el campo requerido `statusCategory` a cada objeto de estado.
- `board-view-mode`: El highlight mode `"category"` ahora usa el `statusCategory` del JSON en lugar del valor derivado automáticamente.

## Impact

- `src/config/defaultConfig.json`: Todos los objetos de estado en todos los workflows deben incluir el nuevo campo `statusCategory`.
- `src/config/defaultConfig.ts`: La función `assignCategory()` será eliminada o ignorada; el campo `category` del tipo `Status` se leerá directamente del JSON.
- `src/domain/types.ts`: El tipo `RawStatus` debe incluir `statusCategory: StatusCategory`.
- Sin cambios en el motor de simulación (`engine.ts`) ni en los componentes de UI (`Column.tsx`, `Board.tsx`, `App.tsx`).
