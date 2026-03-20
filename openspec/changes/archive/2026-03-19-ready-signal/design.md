## Context

El engine actual avanza cada ítem en un solo paso probabilístico: si el draw tiene éxito y el WIP lo permite, el ítem pasa al siguiente `statusId`. No existe la noción de "terminado dentro del status, esperando ser jalado".

Los componentes de UI no necesitan cambios estructurales: `Board.tsx` y `Column.tsx` siguen iguales. Solo `Card.tsx` añade un indicador.

## Goals / Non-Goals

**Goals:**
- Representar la señal de "listo para jalar" en la tarjeta sin columnas adicionales.
- El engine distingue la fase "haciendo" (`isReady: false`) de la fase "esperando pull" (`isReady: true`) dentro del mismo status.
- Retrocompatibilidad total: statuses sin `hasReadySignal` funcionan exactamente igual que antes.
- Cambio mínimo al engine: una condición extra por ítem en los Steps 1, 3, 5, 7.

**Non-Goals:**
- Señal activada manualmente por el usuario (es probabilística como el resto de la simulación).
- WIP separado para ítems ready vs. no-ready dentro del mismo status.
- Representación gráfica compleja del estado ready (un ✓ verde simple es suficiente).

## Decisions

### Decisión 1: Dos fases en el mismo status (no dos statuses)

En vez de expandir a dos statuses (`<id>-doing` / `<id>-ready`), el ítem permanece en el mismo `statusId` y adquiere `isReady: true`. Esto es transparente para Board, Column, y para toda lógica que use `statusId` (WIP tracking, commitment point, delivery point).

**Alternativa descartada:** split column (ver change `split-column`). Requería cambios en Board, Column, config loader, y añadía complejidad de agrupación visual sin beneficio real frente al check verde.

### Decisión 2: Lógica de avance con dos fases

Para un ítem en un status con `hasReadySignal: true`:

```
Fase 1 — Si !isReady:
  draw de advanceProbability
  → éxito: isReady = true  (ítem señalizado, no avanza de status)
  → falla: sin cambio

Fase 2 — Si isReady:
  draw de advanceProbability + chequeo WIP
  → éxito: statusId = next, isReady = undefined  (ítem jalado)
  → falla: sin cambio (sigue visible con ✓, esperando ser jalado)
```

Los dos draws son independientes: un ítem puede tardar N ticks en marcarse ready y M ticks más en ser jalado. Esto crea varianza visual interesante y refleja fielmente la dinámica de pull.

**Alternativa descartada:** Marcar ready y avanzar en el mismo tick (un solo draw). Perdería la separación visual del "listo pero no jalado aún" que es el punto central de la feature.

### Decisión 3: isReady se limpia al salir del status

Cuando un ítem avanza fuera de un `hasReadySignal` status, `isReady` se establece en `undefined` (no `false` para evitar ruido en el estado). De este modo el campo solo tiene valor cuando el ítem está en el status que lo generó.

### Decisión 4: Card.tsx muestra ✓ verde cuando isReady

Un indicador simple: carácter `✓` en color `#22c55e` (verde), posicionado en la esquina inferior derecha de la tarjeta. Solo se muestra si `item.isReady === true`. No requiere cambios en `Column.tsx` ni en `Board.tsx`.

### Decisión 5: WIP limit aplica al status completo (ready + no-ready)

El `wipLimit` del status limita el total de ítems en él, independientemente de si tienen `isReady: true` o no. Esto es correcto: el límite WIP representa la capacidad del proceso completo, no solo de una fase.

## Risks / Trade-offs

- [Trade-off] Con dos draws independientes, el tiempo promedio en un `hasReadySignal` status es aproximadamente el doble que en uno normal (tiempo para ready + tiempo para jalar). Las simulaciones existentes que usen este flag se volverán más lentas en esos statuses. → Documentado; es el comportamiento esperado y visible.
- [Riesgo] En Steps 3, 5, 7 la lógica de avance ya tiene bifurcaciones (commitment point, first-downstream blocking). La condición de `hasReadySignal` se añade como una comprobación previa a esas bifurcaciones. → Mitigación: extraer un helper `advanceOrSignal(item, wf, wipFn, p)` para no duplicar la lógica en los 4 steps.
- [Trade-off] `isReady` en `Workitem` es visible en el estado serializado. Es un campo técnico sin impacto funcional cuando el ítem no está en un `hasReadySignal` status. → Aceptado: el overhead es mínimo.
