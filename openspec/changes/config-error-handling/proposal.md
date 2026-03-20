## Why

Actualmente, si `defaultConfig.json` contiene un nombre de simulación por defecto que no coincide con ninguna simulación definida, o si el archivo está corrupto o mal formado, la aplicación lanza una excepción no capturada que deja la página del navegador en blanco. Esto ocurre porque el módulo `defaultConfig.ts` ejecuta `loadSimulation` al nivel del módulo (en tiempo de carga), sin ningún manejo de errores.

## What Changes

- `defaultConfig.ts` captura errores al cargar la simulación por defecto y expone una configuración fallback en lugar de lanzar una excepción no capturada.
- La app muestra un mensaje de error visible al usuario cuando la configuración no se puede cargar correctamente, en lugar de una pantalla en blanco.
- Se valida que `defaultSimulation` coincida con una simulación existente en la lista; si no coincide, se usa la primera simulación disponible como fallback.
- Si el JSON está corrupto o mal formado (error de parse), se muestra un mensaje de error claro en lugar de fallar silenciosamente.

## Capabilities

### New Capabilities
- `config-error-handling`: Manejo defensivo de errores en la carga de configuración — fallback a primera simulación disponible si la simulación por defecto no existe, y mensaje de error visible si el JSON está corrupto o la estructura es inválida.

### Modified Capabilities
- `simulation-configuration`: El contrato de carga de configuración cambia: la carga ya no puede fallar silenciosamente ni dejar la UI en blanco; debe siempre producir una configuración usable o un estado de error explícito.

## Impact

- `src/config/defaultConfig.ts`: Lógica de fallback y manejo de errores al exportar `defaultConfig` y `defaultSimulationName`.
- `src/App.tsx`: Puede necesitar mostrar un banner/mensaje de error si la configuración cargada es un fallback por error.
- No hay cambios en `defaultConfig.json`, `engine.ts`, ni en los componentes de tablero.
