## Context

La feature de `hasReadySignal` ya existe: los ítems individuales en una columna de trabajo se marcan `isReady: true` y muestran un badge ✓ en la tarjeta. `buffer-column` añade el concepto opuesto: **toda la columna** es ready, por lo que la señal pertenece al encabezado de la columna, no a las tarjetas individuales.

`Column.tsx` recibe el `status` completo y renderiza las tarjetas. `Card.tsx` solo recibe el `Workitem`. Para que Card pueda suprimir el check individual cuando está en una columna buffer, necesita saber si el status es buffer.

## Goals / Non-Goals

**Goals:**
- Campo `isBuffer?: boolean` en `Status` (y en `defaultConfig.json`).
- `Column.tsx` muestra un indicador visual en el header cuando `status.isBuffer === true`.
- Tarjetas en columnas buffer no muestran el badge ✓ individual (el check de la columna lo reemplaza).
- No hay cambios en el engine — buffer es una propiedad de presentación y semántica.
- Retrocompatible: columnas sin `isBuffer` funcionan exactamente igual.

**Non-Goals:**
- Cambiar la velocidad de avance de ítems en buffers (sigue siendo probabilístico).
- Combinar `isBuffer` y `hasReadySignal` en el mismo status (redundante, no se previene pero tampoco se usa).

## Decisions

### Decisión 1: Pasar `isBuffer` como prop a `Card`

`Card` actualmente solo recibe `item: Workitem`. Para suprimir el check individual en buffers, necesita contexto del status. La opción más simple: añadir `isBuffer?: boolean` a las props de `Card`. `Column` pasa `status.isBuffer` cuando renderiza cada tarjeta.

**Alternativa descartada:** Pasar el `status` completo a `Card`. Incrementa el acoplamiento — `Card` no necesita el status completo, solo el flag.

**Alternativa descartada:** Guardar el `statusId` en `Card` y buscar el status en un contexto global. Sobre-ingeniería para un flag booleano.

### Decisión 2: Indicador visual en el header de Column

El header actual es `<div>` de 13px de alto con el nombre y WIP opcional. Para el buffer, se añade:
- Un `✓` verde (`#22c55e`) tras el nombre del status en el header.
- Un `borderTop: "2px solid #22c55e"` en el contenedor de la columna para que sea visible al escanear rápido el board.

El `borderTop` distingue visualmente la columna buffer de la columna de trabajo con `hasReadySignal` (que no tiene border-top). La regla visual es clara: borde superior verde = columna buffer; badge en tarjeta = ítem ready individual.

### Decisión 3: Supresión del check individual en tarjetas buffer

Si un ítem tiene `isReady: true` Y está en una columna buffer (`isBuffer: true`), la Card NO muestra el badge individual ni el borde izquierdo verde. La lógica de supresión está en `Card`, controlada por el prop `isBuffer`. El campo `item.isReady` puede seguir siendo `true` internamente — solo se suprime la presentación.

### Decisión 4: `defaultConfig.json` — statuses a marcar como buffer

**"Simple workflows":**
- L3: `project-todo` (Todo) → buffer de entrada
- L2: primer status upstream de Epic → buffer
- L1/L0: primer status de cada nivel → buffer

**"SDF workflows":**
- L3: `initiative-funnel` (Funnel) → buffer de entrada
- L1: `feat-pending` (Pending) → buffer explícito por nombre
- L0: `spec-todo` (Todo) → buffer de entrada

## Risks / Trade-offs

- [Trade-off] Un ítem podría tener `isReady: true` (del engine) mientras está en una columna buffer. La UI suprime el badge, pero el estado interno de `isReady` no se limpia. → Aceptado: el engine no distingue tipos de columna, y al salir del buffer el `isReady` se limpia normalmente en el siguiente avance.
- [Trade-off] El `borderTop` verde en buffers usa el mismo color que el check de tarjetas ready (`#22c55e`). Esto es intencional — coherencia visual del sistema pull. Ambos significan "listo para jalar".
