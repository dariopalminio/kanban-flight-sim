# Changelog — Kanban Flight Simulator

All notable changes to this project will be documented in this file.


---
## [Unreleased] — 2026-04-07

### Added
- **Simulación "SAFe FL workflows"** — Nuevo modelo de simulación con cuatro niveles jerárquicos (L3: Epic, L2: Capability, L1: Story, L0: Task) que representa el flujo de Portfolio Kanban de SAFe. Incluye estados de Portfolio Backlog, solución, team y tareas técnicas con WIP limits configurados.
- **Configuración GCP Cloud Run** — Archivos `Dockerfile` (build multi-stage Node 22 + nginx), `nginx.conf` (SPA fallback + cache de assets), `.dockerignore` y `cloudbuild.yaml` para CI/CD con Artifact Registry y despliegue automático en Cloud Run.

### Fixed
- **WIP limit en primera columna al inyectar hijos** — Al cruzar el commitment point, el motor de simulación ahora respeta el `wipLimit` de `statuses[0]` al crear ítems hijo en L0, L1 y L2. Anteriormente los hijos se insertaban incondicionalmente, desbordando el límite. Afectaba a cualquier simulación con `wipLimit` definido en la primera columna (SDDF y SAFe FL).

---
## [v1.0.2] Released — WIP Limits Editable — 2026-04-06

### Added
- **Editable WIP limits** — El encabezado de cada columna con WIP limit muestra un `<input type="number">` que permite editar el límite en runtime. El nuevo valor se aplica al perder foco (`onBlur`) o al presionar Enter, y se cancela con Escape. Los cambios se reflejan inmediatamente en la UI y se preservan al cambiar de simulación o resetear.  

Ahora los usuarios pueden ajustar dinámicamente los WIP limits para experimentar con diferentes configuraciones sin modificar el JSON de configuración ni recargar la página, facilitando la exploración de escenarios y el aprendizaje interactivo.

---

## [v1.0.1] Released - Caminando el tablero y DODs — 2026-04-05

### Added
- **Header de la aplicación** — El header superior muestra el logo SVG de la aplicación (`logo-kanban-flight-sim.svg`) y el título "Kanba-Flight-Sim" como identidad visual persistente en la parte superior de la UI.
- **Iconos en controles de simulación** — Los botones Step, Autoplay/Pause, Reset, Slower y Faster incluyen ahora iconos de `lucide-react` para mayor claridad visual en el toolbar.
- **Modos de vista de nivel único** — El selector de modo de tablero incorpora tres nuevas opciones: `L3`, `L2` y `L1` para enfocar la vista en un único nivel jerárquico, reduciendo el ruido visual.
- **Modo "Sin L0"** (`without-l0`) — Nuevo toggle en `SimulationSelector` para ejecutar la simulación sin nivel L0. En este modo L1 avanza de forma autónoma sin spawn ni bloqueo por hijos L0. Al activar o desactivar el toggle la simulación se reinicia automáticamente.
- **Scroll en columnas Done** — Las columnas `DONE` que superen `DONE_COLUMN_SCROLL_THRESHOLD = 5` tarjetas muestran scroll interno con altura máxima proporcional (`CARD_HEIGHT_PX = 18`). El scroll se posiciona automáticamente al final para mostrar siempre los ítems más recientes. Todas las columnas muestran el conteo de ítems en el encabezado (`[count: N]` o `[wip: N / limit: M]`).
- **Botón DoD en columnas** — Los estados que tengan el campo `definitionOfDone` en la configuración muestran un botón "DoD" en el encabezado de la columna. Al hacer click se despliega un panel overlay con el texto completo de la Definition of Done, posicionado absolutamente dentro de la columna. El panel es colapsable con un segundo click.

### Changed
- **Refactor de componentes del toolbar** — Los controles de UI se extrajeron de `App.tsx` en tres componentes independientes: `SimulationSelector.tsx`, `SimulationControls.tsx` y `KanbanSignalSelector.tsx`. `App.tsx` es ahora un orchestrator ligero sin cambios de comportamiento.
- **Tipo `Status`** — Campo opcional `definitionOfDone?: string` agregado al tipo de dominio para soportar el texto de Definition of Done por estado de configuración.

---

## [v1.0.1d] no released  — 2026-04-01

### Added
- **Control de velocidad del Tick (ms)** — Autoplay ahora permite ajustar la cadencia en runtime desde el header con botones **Slower** y **Faster**. Se muestra el valor activo como `Tick ms: <n>` y se aplica con límites para evitar valores extremos:
  - mínimo: `100 ms`
  - máximo: `5000 ms`
  - paso: `100 ms`
- **Flash visual al avanzar de estado** (`tick-flash`) — Las tarjetas que avanzan en el tick actual muestran una animación breve de borde/glow verde (`#22c55e`) durante ~0.6s, usando el keyframe global `@keyframes tick-flash` definido en `index.html`.
- **Walk the Board (pull sequencing)** — El avance de ítems en cada nivel cambia de paralelo a secuencial de derecha a izquierda, emulando la práctica Lean de "caminar el tablero". Cada columna ve el estado actualizado de su vecina derecha en el mismo tick, de modo que un espacio liberado puede ser ocupado en ese mismo tick por la columna de la izquierda. El FIFO existente (`enteredAt`) se preserva sin cambios.

### Changed
- **Autoplay configurable** — El intervalo dejó de ser fijo (1 segundo) y ahora usa el valor seleccionado por el usuario en cada ciclo de `setInterval`, incluyendo cambios en caliente mientras la simulación está corriendo.
- **Threading de tick actual en componentes** — `currentTick` se propaga `App → Board → Column → Card` para habilitar comportamientos visuales dependientes del tick actual.
- **Reset y cambio de simulación restablecen velocidad por defecto** — Al presionar Reset o cambiar de simulación, la velocidad vuelve a `1000 ms` para mantener un estado inicial predecible.

## [v1.0.1c] no released — 2026-03-19

### Added
- **Columnas buffer** (`isBuffer`) — Un status marcado `"isBuffer": true` es un buffer de entrada por naturaleza: todos los ítems en él están implícitamente listos para ser jalados. La columna muestra un `✓` verde (`#22c55e`) en el encabezado y un borde superior verde de 2px. Las tarjetas dentro de la columna **no** muestran el badge individual (el check de la columna reemplaza al check de tarjeta). Configurado en los buffers de ambas simulaciones:
  - *Simple workflows*: `project-todo`, `epic-todo`, `story-todo`, `subtask-todo`
  - *SDF workflows*: `initiative-funnel`, `feat-pending`, `spec-todo`
- **Señal ready en tarjetas** (`hasReadySignal`) — Los statuses de trabajo pueden marcarse `"hasReadySignal": true` para activar avance en dos fases: el ítem primero se marca `isReady: true` (señal visual) y en un tick posterior avanza al siguiente status. La tarjeta muestra un badge `✓` verde circular, borde izquierdo verde y glow al estar lista. Implementado en los statuses de trabajo de *SDF workflows*.
- **Manejo de errores de configuración** — La página nunca queda en blanco ante JSON malformado o `defaultSimulation` no encontrado:
  - JSON inválido: se muestra un mensaje de error legible en pantalla (ErrorBoundary + handler inline en `index.html`).
  - Nombre de simulación no encontrado: se carga la primera simulación disponible como fallback y se muestra un banner de advertencia amarillo en la UI.

---

## [v1.0.1b] no released  — 2026-03-19

### Added
- **Selector de vista de tableros** — Grupo de radio buttons ("Portafolio", "Delivery", "Full") en el panel de controles que filtra qué tableros se muestran:
  - *Portafolio*: muestra L3 y L2 (vista estratégica). Selección por defecto al cargar.
  - *Delivery*: muestra L2, L1 y L0 (vista operativa).
  - *Full*: muestra los cuatro tableros simultáneamente.
  Los tableros no visibles se desmontan del DOM; el estado de simulación se preserva al cambiar de vista.

### Fixed
- **Orden incorrecto en L0 Simplified** — El estado `In-Progress` del workflow Subtask tenía `order: 3` (saltándose el 2), lo que impedía que `getNextStatusId` encontrara el siguiente estado desde `Todo`. Los workitems L0 nunca salían de "Todo", bloqueando la cadena completa L0→L1→L2→L3. Corregido a `order: 2` y `Done` a `order: 3`.

---

## [v1.0.1a] no released  — 2026-03-19

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
