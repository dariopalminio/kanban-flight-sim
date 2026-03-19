## Context

El motor actual tiene 7 pasos y termina retornando el nuevo `SimState`. Para añadir demanda continua solo hace falta un Step 8 al final que, condicionalmente, añada un nuevo ítem L3 al array de workitems resultante.

El parámetro `demandInterval` vive en la configuración JSON y fluye por `Config` → `tick()`. No requiere estado adicional en `SimState` porque el criterio de inyección es `(tick + 1) % demandInterval === 0` — computable desde el tick counter que ya existe.

## Goals / Non-Goals

**Goals:**
- Inyectar un ítem L3 cada `demandInterval` ticks cuando el valor es > 0
- `demandInterval: 0` desactiva la generación (retrocompatibilidad total)
- Los nuevos ítems usan el mismo esquema de IDs y el mismo `idCounters.L3`
- `tick()` sigue siendo una función pura

**Non-Goals:**
- No se añade UI para editar `demandInterval` en caliente (solo via JSON)
- No se modela demanda variable (burst, probabilística, etc.)
- No se limita la demanda por WIP del primer estado L3

## Decisions

### D1: Step 8 al final del tick, usando `state.tick + 1` como número de tick resultante

La inyección ocurre cuando `(state.tick + 1) % demandInterval === 0`.
Se usa `state.tick + 1` (el tick que se está produciendo) para que el primer ítem inyectado aparezca en el tick `demandInterval`, no en el tick 0.

**Alternativa descartada — usar `state.tick`:** causaría inyección en tick 0 cuando `demandInterval` divide exactamente a 0 (siempre), lo que no tiene sentido semántico.

### D2: `demandInterval: 0` como valor de desactivación

Permite omitir la feature sin quitar el campo del JSON. El check `if (!demandInterval || demandInterval <= 0)` cortocircuita sin dividir entre cero.

**Alternativa descartada — campo opcional (`demandInterval?`):** requeriría manejo de `undefined` en TypeScript y haría el JSON menos explícito. Un valor explícito `0` es más claro.

### D3: El nuevo ítem L3 se coloca en `wfL3.statuses[0].id` (primer estado del workflow)

Consistente con `buildInitialState`. No hay razón para inyectar en otro estado.

### D4: Sin límite de WIP en la inyección

La demanda entrante modela trabajo que llega al sistema independientemente de la capacidad interna. Aplicar WIP al punto de entrada bloquearía el flujo externo, que no es una restricción Kanban estándar para el backlog upstream.

## Risks / Trade-offs

- **Risk: Crecimiento ilimitado de workitems** — con `demandInterval` bajo y simulación larga, el número de ítems puede crecer indefinidamente, degradando el rendimiento del render.
  → Mitigación: los valores por defecto en los JSON bundled usarán intervalos conservadores (ej: 5 ticks). El usuario puede ajustar en JSON o usar `0` para desactivar.

- **Risk: Confusión con `initialReleaseCount`** — ambos parámetros generan ítems L3; un usuario podría confundirlos.
  → Mitigación: comentar claramente en el JSON bundled la diferencia (inicial vs. continuo).
