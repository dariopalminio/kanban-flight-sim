## Why

`defaultConfig.json` concentra los tres modelos de simulación en un único archivo que ya supera las 600 líneas. Añadir o editar un modelo requiere navegar un JSON monolítico, con alto riesgo de errores de sintaxis y dificulta la revisión en PRs. Separar cada modelo en su propio archivo mejora la mantenibilidad y hace que agregar una nueva simulación sea una operación completamente aislada.

## What Changes

- **BREAKING** — La clave `"simulations"` en `defaultConfig.json` pasa a llamarse `"models"`. El campo `defaultSimulation` conserva su nombre.
- El arreglo de modelos se elimina de `defaultConfig.json`; en su lugar, cada modelo vive en `src/config/models/<slug>.json` (un archivo por simulación).
- El loader `defaultConfig.ts` reemplaza el import estático de `defaultConfig.json` por una carga dinámica vía `import.meta.glob` que lee todos los archivos `*.json` bajo `src/config/models/` en tiempo de build.
- `defaultConfig.json` queda reducido a los campos de configuración global: `{ "defaultModel": "<name>" }`.
- La API pública de `defaultConfig.ts` no cambia: `simulationNames`, `defaultSimulationName`, `loadSimulation()`, `defaultConfig`, `configLoadResult` siguen siendo los mismos identificadores exportados.
- Todos los usos internos de la palabra `simulation` en el loader (variables, tipos internos) se renombran a `model` para consistencia; los exports públicos que ya usan `simulation` se mantienen para no romper el resto del codebase.

## Capabilities

### New Capabilities
- `per-model-config-files`: Cada modelo de simulación reside en `src/config/models/<slug>.json`. El loader los importa todos mediante `import.meta.glob` y los expone con la misma API existente. Agregar un nuevo modelo no requiere tocar ningún archivo TypeScript ni el `defaultConfig.json` raíz.

### Modified Capabilities
- `simulation-configuration`: La estructura de `defaultConfig.json` cambia: el arreglo `simulations` desaparece del archivo raíz y pasa a estar distribuido en archivos individuales. La clave se renombra de `simulations` a `models`. El comportamiento de fallback y error handling se mantiene idéntico.

## Impact

- **`src/config/defaultConfig.json`** — queda sólo con `{ "defaultModel": "..." }`.
- **`src/config/defaultConfig.ts`** — reemplaza import JSON único por `import.meta.glob`; tipos internos renombrados de `RawSimulation`/`RawConfig` a `RawModel`/`RawRootConfig`.
- **`src/config/models/`** — directorio nuevo con tres archivos: `essential-kanban-fl.json`, `sddf-workflows.json`, `safe-fl-workflows.json`.
- No hay cambios en `domain/types.ts`, `simulation/engine.ts`, ni en ningún componente React.
- Requiere Vite ≥ 3 (ya presente), que soporta `import.meta.glob` con `{ eager: true }`.
