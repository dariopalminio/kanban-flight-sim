## Why

El simulador incluye modelos Kanban (Essential Kanban FL, SDDF) y SAFe, pero no tiene ninguno basado en **Extreme Programming (XP)**. Agregar "XP-FL Workflows" permite a los usuarios explorar el flujo de valor en contextos XP, donde la cadencia está organizada alrededor de iteraciones y el compromiso se toma en la frontera Iteration-Plan → Committed.

## What Changes

- Se agrega **un único archivo** `src/config/models/xp-fl-workflows.json` con el nuevo modelo.
- No se modifica ningún archivo TypeScript ni de configuración existente — el loader usa `import.meta.glob` y lo recoge automáticamente.
- El modelo define **tres niveles activos** (L3, L2, L1) más un L0 mínimo de placeholder ("Task") necesario para satisfacer el motor de simulación.

## Capabilities

### New Capabilities
- `xp-fl-model`: Modelo de simulación "XP-FL Workflows" con flujos jerárquicos propios de XP/agile ligero en tres niveles operativos (Initiative → Release/Epic → User Story), más un nivel L0 de tareas técnicas.

### Modified Capabilities
_(ninguna — la estructura de modelos no cambia)_

## Impact

- **`src/config/models/xp-fl-workflows.json`** — archivo nuevo, ~200 líneas.
- Sin cambios en TypeScript, motor, componentes ni `defaultConfig.json`.
- El modelo aparece automáticamente en el selector de simulaciones al recargar la app.
