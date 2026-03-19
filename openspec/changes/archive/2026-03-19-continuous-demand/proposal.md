## Why

La simulación actual parte de N ítems L3 fijos y converge a un estado terminal donde todo está en `Done` — modelando un proyecto finito, no un sistema Kanban. Un sistema Kanban real opera con demanda continua y nunca "termina"; esta diferencia es conceptualmente fundamental (Anderson 2010, 2023) y el simulador no la captura hoy.

## What Changes

- Se añade un parámetro de configuración `demandInterval` por simulación: cada cuántos ticks se inyecta un nuevo ítem L3 en el primer estado del workflow L3.
- El motor `tick()` genera un nuevo ítem L3 al final de cada tick donde `tick % demandInterval === 0`.
- `demandInterval: 0` (o ausente) desactiva la generación continua — preserva el comportamiento actual.
- Los IDs de los nuevos ítems siguen el esquema existente (`PREFIX-N`) usando el contador L3 de `idCounters`.

## Capabilities

### New Capabilities

- `continuous-demand`: Generación automática periódica de nuevos workitems L3 durante la simulación, configurable por intervalo de ticks.

### Modified Capabilities

- `simulation-configuration`: Se añade el parámetro `demandInterval` al schema de cada simulación en `defaultConfig.json`.
- `simulation-engine`: El tick pasa a incluir un Step 8 — inyectar demanda si corresponde.

## Impact

- `src/simulation/engine.ts` — añadir Step 8 al final de `tick()`
- `src/config/defaultConfig.json` — añadir `demandInterval` a cada simulación
- `src/config/defaultConfig.ts` — incluir `demandInterval` en `Config` / `buildConfig`
- `src/domain/types.ts` — añadir `demandInterval: number` a `Config`
- No hay cambios en componentes UI ni en el sistema de highlights
