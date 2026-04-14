## Context

`src/config/defaultConfig.json` es actualmente el único archivo de configuración: contiene `defaultSimulation` y un arreglo `simulations` con los tres modelos completos (~650 líneas). El loader `defaultConfig.ts` importa ese archivo con un import estático (`?raw` + `JSON.parse`).

El objetivo es fragmentar el arreglo de modelos en archivos individuales bajo `src/config/models/` y que el loader los recoja automáticamente, manteniendo la API pública sin cambios.

## Goals / Non-Goals

**Goals:**
- Un archivo JSON por modelo en `src/config/models/<slug>.json`.
- `defaultConfig.json` queda reducido a `{ "defaultModel": "<name>" }`.
- La clave del arreglo en el contexto del loader pasa a llamarse `models`.
- El loader carga todos los archivos del directorio sin importarlos uno por uno.
- API pública de `defaultConfig.ts` sin cambios (`simulationNames`, `defaultSimulationName`, `loadSimulation`, `defaultConfig`, `configLoadResult`).

**Non-Goals:**
- Carga dinámica en runtime (lazy / fetch en el navegador). Los archivos se resuelven en build-time.
- Cambios en `engine.ts`, componentes React, o `domain/types.ts`.
- Sistema de plugins o registro externo de modelos.

## Decisions

### D1 — `import.meta.glob` con `eager: true`

**Elegido:** `import.meta.glob('../config/models/*.json', { eager: true })`

Vite resuelve el glob en build-time y genera imports estáticos por cada archivo encontrado. Con `eager: true` los módulos se incluyen en el bundle sin necesidad de `await`. El resultado es un objeto `Record<string, { default: RawModel }>` indexado por ruta de archivo.

**Alternativas descartadas:**
- *Import estático individual por archivo* — requeriría tocar el loader cada vez que se agrega un modelo; contradice el objetivo.
- *fetch en runtime* — añade asincronía a lo que hoy es síncrono; rompe el contrato de `configLoadResult` y `simulationNames` como valores de módulo.
- *barrel `models/index.ts`* — lo mismo que importación individual; el barrel debe actualizarse manualmente.

### D2 — Orden de los modelos = orden alfabético de archivo

`import.meta.glob` no garantiza un orden determinista entre entornos. Para que `simulationNames` y el fallback al primer modelo sean predecibles, los módulos se ordenan por nombre de archivo (clave del objeto). Convención de nombres: `<slug>.json` donde `slug` es el nombre del modelo en kebab-case.

**Alternativa descartada:** campo `order` en cada JSON — añade complejidad sin beneficio real.

### D3 — Estructura de cada archivo modelo

Cada `models/<slug>.json` es exactamente la forma de un elemento del antiguo arreglo `simulations`: `{ name, initialReleaseCount, advanceProbability, childrenPerParent, demandInterval?, workflows }`. No se añade metadata extra.

### D4 — `defaultConfig.json` conserva `defaultModel` (antes `defaultSimulation`)

El campo global se renombra de `defaultSimulation` a `defaultModel` para alinearse con la nueva terminología. El loader exporta `defaultSimulationName` como alias hacia atrás (mismo export, distinto origen interno), sin cambios para los consumidores.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| `import.meta.glob` sólo funciona con Vite. Si en el futuro se migra a otro bundler, este mecanismo debe reescribirse. | Aceptable dado que toda la toolchain ya depende de Vite (dev server, build, HMR). |
| Un archivo `models/*.json` con JSON inválido rompe el módulo en build-time con un error críptico. | El `try/catch` existente en el loader captura errores de parse y los expone vía `configLoadResult.error` igual que antes. |
| El orden de `simulationNames` cambia si los slugs de archivo no coinciden con el orden original. | Los slugs se definen en las tareas con el mismo orden que el arreglo actual. |

## Migration Plan

1. Crear `src/config/models/` y añadir los tres archivos JSON.
2. Actualizar `defaultConfig.json` → sólo `{ "defaultModel": "..." }`.
3. Actualizar `defaultConfig.ts` → reemplazar import `?raw` + `JSON.parse` por `import.meta.glob`.
4. Sin cambio de rutas públicas ni variables de entorno.
5. Rollback: restaurar los tres archivos originales (están en git).

## Open Questions

Ninguna pendiente.
