# Changelog — Kanban Flight Simulator

All notable changes to this project will be documented in this file.

---

## [v1.0.3] — 2026-03-19

### Added
- **Columnas buffer** (`isBuffer`) — Un status marcado `"isBuffer": true` es un buffer de entrada por naturaleza: todos los ítems en él están implícitamente listos para ser jalados. La columna muestra un `✓` verde (`#22c55e`) en el encabezado y un borde superior verde de 2px. Las tarjetas dentro de la columna **no** muestran el badge individual (el check de la columna reemplaza al check de tarjeta). Configurado en los buffers de ambas simulaciones:
  - *Simple workflows*: `project-todo`, `epic-todo`, `story-todo`, `subtask-todo`
  - *SDF workflows*: `initiative-funnel`, `feat-pending`, `spec-todo`
- **Señal ready en tarjetas** (`hasReadySignal`) — Los statuses de trabajo pueden marcarse `"hasReadySignal": true` para activar avance en dos fases: el ítem primero se marca `isReady: true` (señal visual) y en un tick posterior avanza al siguiente status. La tarjeta muestra un badge `✓` verde circular, borde izquierdo verde y glow al estar lista. Implementado en los statuses de trabajo de *SDF workflows*.
- **Manejo de errores de configuración** — La página nunca queda en blanco ante JSON malformado o `defaultSimulation` no encontrado:
  - JSON inválido: se muestra un mensaje de error legible en pantalla (ErrorBoundary + handler inline en `index.html`).
  - Nombre de simulación no encontrado: se carga la primera simulación disponible como fallback y se muestra un banner de advertencia amarillo en la UI.

---

## [v1.0.2] — 2026-03-19

### Added
- **Selector de vista de tableros** — Grupo de radio buttons ("Portafolio", "Delivery", "Full") en el panel de controles que filtra qué tableros se muestran:
  - *Portafolio*: muestra L3 y L2 (vista estratégica). Selección por defecto al cargar.
  - *Delivery*: muestra L2, L1 y L0 (vista operativa).
  - *Full*: muestra los cuatro tableros simultáneamente.
  Los tableros no visibles se desmontan del DOM; el estado de simulación se preserva al cambiar de vista.

### Fixed
- **Orden incorrecto en L0 Simplified** — El estado `In-Progress` del workflow Subtask tenía `order: 3` (saltándose el 2), lo que impedía que `getNextStatusId` encontrara el siguiente estado desde `Todo`. Los workitems L0 nunca salían de "Todo", bloqueando la cadena completa L0→L1→L2→L3. Corregido a `order: 2` y `Done` a `order: 3`.

---

## [v1.0.1] — 2026-03-19

### Fixed
- **Premature child spawn** — Los workitems hijos ya no se crean mientras el padre está bloqueado por WIP limit en el commitment point. El spawn es ahora atómico con la transición: si el padre no puede cruzar (WIP o probabilidad), no se crean hijos. Corrige una violación del principio *last responsible moment*.

### Added
- **Demanda continua** (`demandInterval`) — Nuevo parámetro de configuración por simulación. Cuando es > 0, el motor inyecta un nuevo ítem L3 cada N ticks al final del tick (Step 8), transformando la simulación de "proyecto finito" a "sistema de flujo continuo". Valor `0` desactiva la feature (comportamiento previo preservado).
  - "Simplified": `demandInterval: 5`
  - "SDF workflows": `demandInterval: 0`

---

## [v1.0.0] MVP — 2026-03-18

### Added
- **Motor de simulación puro** (`engine.ts`) — `tick(state, config) → state` función pura sin efectos secundarios. Ejecuta 7 pasos ordenados por tick con reglas jerárquicas L0–L3, avance probabilístico (50% por defecto), bloqueo en first-downstream hasta que todos los hijos estén en delivery, y spawn de hijos en el commitment point.
- **Configuración data-driven** (`defaultConfig.json`) — Todas las simulaciones, workflows, estados y parámetros definidos en JSON. Agregar una nueva simulación no requiere cambios de código.
- **Cuatro tableros Kanban apilados** — Un tablero por nivel (L3→L0), con columnas por estado y tarjetas de colores por nivel (violeta/azul/naranja/verde).
- **Dos simulaciones bundled:**
  - *Simplified* — 4 estados por nivel (`Backlog → Committed → In-Progress → Done`)
  - *SDF workflows* — Flujos complejos: Project (7), Release (10), Feat (8), Spec (7) estados
- **WIP Limits** — Enforcement por columna con tracker intra-tick (evita que múltiples ítems rompan el límite en el mismo tick). Display `[actual/límite]` en el encabezado de columna.
- **Selector de simulación** — Dropdown en el header para cambiar entre simulaciones; resetea estado y detiene autoplay automáticamente.
- **Controles de simulación** — Step (avance manual), Autoplay/Pause (1 tick/segundo), Reset.
- **Highlight modes mutuamente excluyentes** — Upstream/Downstream, Status Category (TODO/IN-PROGRESS/DONE), Commitment Status, Delivery Status.
- **UI responsiva** — Columnas con `flex-wrap`, sin scroll horizontal. Diseño oscuro compacto con alta densidad de información.
- **Nomenclatura de IDs jerárquica** — Formato `PREFIX-N` para L3, `PREFIX-NpPARENT` para niveles inferiores (ej: `EPIC-1pPROJ-1`).

### Documentation
- `doc/specs/mvp-software-spec.md` — Especificación completa de requerimientos funcionales y no funcionales
- `README.md` — Guía de uso, controles, configuración y arquitectura
- `openspec/` — Baseline de specs OpenSpec (simulation-engine, workitem-lifecycle, simulation-configuration, kanban-board-ui, simulation-controls)
