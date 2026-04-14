## 1. Crear archivos de modelos individuales

- [x] 1.1 Crear directorio `src/config/models/`
- [x] 1.2 Extraer el modelo "Essential Kanban FL" de `defaultConfig.json` → `src/config/models/essential-kanban-fl.json`
- [x] 1.3 Extraer el modelo "SDDF workflows" → `src/config/models/sddf-workflows.json`
- [x] 1.4 Extraer el modelo "SAFe FL workflows" → `src/config/models/safe-fl-workflows.json`
- [x] 1.5 Verificar que cada archivo JSON es válido y contiene `name`, parámetros numéricos y `workflows` con claves `L3`/`L2`/`L1`/`L0`

## 2. Actualizar defaultConfig.json

- [x] 2.1 Reducir `defaultConfig.json` a `{ "defaultModel": "Essential Kanban FL" }` — eliminar el arreglo `simulations` y renombrar la clave

## 3. Actualizar el loader defaultConfig.ts

- [x] 3.1 Reemplazar el import `?raw` de `defaultConfig.json` por un import directo del JSON reducido (sólo `defaultModel`)
- [x] 3.2 Agregar `import.meta.glob` para cargar todos los archivos `src/config/models/*.json` con `{ eager: true }`
- [x] 3.3 Ordenar los módulos cargados por nombre de archivo (clave del objeto) para garantizar orden determinista
- [x] 3.4 Renombrar los tipos internos `RawSimulation` → `RawModel` y `RawConfig` → `RawRootConfig`
- [x] 3.5 Adaptar la lógica de `simulationNames`, `defaultSimulationName` y `loadSimulation()` para leer del arreglo de modelos cargados vía glob
- [x] 3.6 Adaptar `configLoadResult` para manejar errores de carga del glob (JSON inválido, directorio vacío)
- [x] 3.7 Verificar que todos los exports públicos (`simulationNames`, `defaultSimulationName`, `loadSimulation`, `defaultConfig`, `configLoadResult`) siguen siendo los mismos identificadores

## 4. Verificación manual

- [x] 4.1 Ejecutar `npm run dev` y confirmar que los tres modelos aparecen en el selector
- [x] 4.2 Confirmar que cada modelo carga y la simulación corre sin errores en consola
- [x] 4.3 Confirmar que el modelo por defecto ("Essential Kanban FL") es el activo al iniciar
- [x] 4.4 Ejecutar `npm run build` y verificar que el build termina sin errores de TypeScript ni Vite
