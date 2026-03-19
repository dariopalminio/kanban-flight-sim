## Context

En `engine.ts`, Steps 3, 5 y 7 siguen esta lógica por cada ítem padre:

```
if (w.statusId === keysLn.commitmentId) {
  // spawn children here ← BUG: padre puede quedarse atascado aquí por WIP
}
if (!maybe(advanceProbability)) return w;
const next = getNextStatusId(wf, w.statusId);
if (!wipL(w.statusId, next)) return w;   // WIP check — puede fallar
return { ...w, statusId: next };
```

El problema: los hijos se crean **antes** de verificar si el padre puede avanzar. Si el WIP check falla, el padre queda en `commitmentId` con hijos ya creados en el nivel inferior, pero sin haber cruzado el commitment point. En ticks siguientes la condición `!hasChildren` impide volver a crearlos, por lo que el estado queda consistente internamente, pero el comportamiento es incorrecto desde la perspectiva del dominio.

El contrato actual de `tick()` no es cuestionado — sigue siendo una función pura. Solo cambia cuándo dentro del step se dispara el spawn.

## Goals / Non-Goals

**Goals:**
- Los hijos se crean únicamente cuando el padre cruza efectivamente al primer estado downstream
- Si el padre no puede cruzar (bloqueado por WIP o probabilidad), no se crean hijos en ese tick
- El fix aplica simétricamente a los tres niveles afectados (Steps 3, 5, 7)
- La función `tick()` sigue siendo pura

**Non-Goals:**
- No se cambia ningún otro aspecto de las reglas jerárquicas
- No se modifica la lógica de bloqueo en `firstDownstreamId` (la espera de hijos en `isPosDeliveryPoint`)
- No se introduce configuración nueva en el JSON
- No se tocan componentes UI ni tipos de dominio

## Decisions

### D1: Spawn en la transición hacia firstDownstream, no en commitmentId

**Actual:** hijos creados al detectar `w.statusId === commitmentId`
**Nuevo:** hijos creados justo antes de emitir la transición hacia `firstDownstreamId`

La lógica en Step 3 (y análogamente en Steps 5 y 7) pasa a ser:

```
// Si el padre está en commitmentId Y puede avanzar Y la probabilidad lo permite:
//   → crear hijos (si no existen aún)
//   → mover al primer downstream (subject to WIP)
```

El spawn se convierte en parte atómica de la transición: o el padre cruza y se crean hijos, o el padre no cruza y no se crean hijos.

**Alternativa descartada — Spawn en commitmentId con flag "pendiente":**
Se podría marcar al padre como "comprometido pero sin cruzar" y crear hijos solo al cruzar. Requeriría un campo adicional en `Workitem` y lógica extra. Innecesariamente complejo para el objetivo.

**Alternativa descartada — Spawn en el Step de push (Steps 2, 4, 6):**
Los pasos de push mueven al padre directamente a firstDownstream, pero son accionados por los hijos. No se puede crear hijos en el push porque los hijos deben existir antes de que existan — dependencia circular.

### D2: La condición `!hasChildren` se mantiene como guarda idempotente

El check de "ya tiene hijos" permanece para evitar re-spawn en ticks donde el padre ya cruzó y tiene hijos en vuelo. Con el nuevo orden, esta guarda cubre el caso de un padre que cruzó en un tick anterior y ahora está en `firstDownstreamId` o más allá.

## Risks / Trade-offs

- **Risk: Cambio de comportamiento observable en todas las simulaciones con WIP** — en "Simplified" y "SDF workflows", los tableros mostrarán menos ítems en niveles inferiores hasta que el padre efectivamente cruce.
  → Esto es el comportamiento correcto y deseado; no es un riesgo sino el objetivo.

- **Risk: Los Steps 2, 4 y 6 (push) ya no encontrarán hijos pre-existentes al ejecutarse en el mismo tick** — actualmente, cuando un padre llega a commitmentId en Step 3 y crea hijos, esos hijos en `statuses[0]` (upstream) no están en downstream, así que los Steps 4/6 no se ven afectados. Con el fix, los hijos se crean en el mismo tick en que el padre cruza a firstDownstream; en ese mismo tick, los hijos estarán en `statuses[0]` (upstream todavía), por lo que los Steps de push del nivel superior no se activarán hasta el tick siguiente. Este comportamiento es idéntico al actual — no hay diferencia observable.

- **Risk: Pérdida de coherencia si el mismo tick genera push (Step 2) y spawn (Step 3)** — Step 2 puede mover al padre a firstDownstream; Step 3 luego evalúa al padre ya en firstDownstream. Con el fix, Step 3 solo haría spawn si el padre está en commitmentId, lo que no aplica aquí (ya pasó a firstDownstream por el push). Sin conflicto.
