# Changelog — Kanban Flight Simulator

All notable changes to this project will be documented in this file.

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
