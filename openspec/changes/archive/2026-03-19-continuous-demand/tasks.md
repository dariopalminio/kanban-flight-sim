## 1. Tipos y configuración

- [x] 1.1 En `src/domain/types.ts`: añadir `demandInterval: number` al tipo `Config`
- [x] 1.2 En `src/config/defaultConfig.ts`: incluir `demandInterval` en `buildConfig()` (leer de la simulación JSON)
- [x] 1.3 En `src/config/defaultConfig.json`: añadir `"demandInterval": 5` a la simulación "Simplified"
- [x] 1.4 En `src/config/defaultConfig.json`: añadir `"demandInterval": 0` a la simulación "SDF workflows" (desactivado por defecto)

## 2. Motor de simulación

- [x] 2.1 En `src/simulation/engine.ts`: añadir Step 8 al final de `tick()` — si `config.demandInterval > 0` y `(state.tick + 1) % config.demandInterval === 0`, crear un nuevo ítem L3 en `wfL3.statuses[0].id` usando `nextId(counters, "L3", wfL3.workitemName)`
- [x] 2.2 Verificar que el nuevo ítem se añade a `items` antes del `return` final y que `counters` actualizado se incluye en el estado retornado

## 3. Verificación manual en el simulador

- [x] 3.1 Cargar "Simplified" (demandInterval=5) y en autoplay confirmar que aparece un nuevo ítem L3 cada 5 ticks
- [x] 3.2 Verificar que el nuevo ítem inicia en la primera columna del tablero L3
- [x] 3.3 Cargar "SDF workflows" (demandInterval=0) y confirmar que no se generan ítems automáticos
- [x] 3.4 Verificar que Reset elimina todos los ítems generados y vuelve al estado inicial
