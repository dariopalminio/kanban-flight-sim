# 🧠 Simulador de Vuelo Kanban — Especificación de Requerimientos de Software

## Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Objetivos](#2-objetivos)
3. [Modelo de Dominio](#3-modelo-de-dominio)
4. [Workflows](#4-workflows)
   - [4.1 Simulación "Simplified"](#41-simulación-simplified)
   - [4.2 Simulación "SDF workflows"](#42-simulación-sdf-workflows)
   - [4.3 Propiedades de cada estado](#43-propiedades-de-cada-estado-status)
5. [Reglas de Negocio](#5-reglas-de-negocio)
   - [5.1 Paso 1 — L0 autónomo](#51-paso-1--l0-avanza-de-forma-autónoma)
   - [5.2 Paso 2 — L1 activado por L0](#52-paso-2--l1-se-activa-cuando-l0-comienza-a-trabajar)
   - [5.3 Paso 3 — L1 con reglas](#53-paso-3--l1-avanza-con-reglas-jerárquicas)
   - [5.4 Paso 4 — L2 activado por L1](#54-paso-4--l2-se-activa-cuando-l1-comienza-a-trabajar)
   - [5.5 Paso 5 — L2 con reglas](#55-paso-5--l2-avanza-con-reglas-jerárquicas)
   - [5.6 Paso 6 — L3 activado por L2](#56-paso-6--l3-se-activa-cuando-l2-comienza-a-trabajar)
   - [5.7 Paso 7 — L3 con reglas](#57-paso-7--l3-avanza-con-reglas-jerárquicas)
   - [5.8 Reglas Globales](#58-reglas-globales)
   - [5.9 Derivación automática de STATUS-CATEGORY](#59-derivación-automática-de-status-category)
   - [5.10 Punto de Compromiso](#510-punto-de-compromiso-commitment-status)
6. [Modelo de Simulación](#6-modelo-de-simulación)
7. [Interfaz de Usuario](#7-interfaz-de-usuario)
   - [7.1 Selector de Simulación](#71-selector-de-simulación)
   - [7.2 Layout General](#72-layout-general)
   - [7.3 Tarjetas (workitems)](#73-tarjetas-workitems)
   - [7.4 Características UI](#74-características-ui)
   - [7.5 Botones de Acción](#75-botones-de-acción)
8. [Requerimientos Funcionales](#8-requerimientos-funcionales)
9. [Requerimientos No Funcionales](#9-requerimientos-no-funcionales)
10. [Posibles Extensiones](#10-posibles-extensiones)
11. [Consideraciones Técnicas](#11-consideraciones-técnicas)
12. [Definición de Done](#12-definición-de-done)
13. [Glosario](#13-glosario)

---

## 📌 1. Descripción General

El **Simulador de Vuelo Kanban (KanbanFlightSim)** es una aplicación frontend que simula visualmente flujos de trabajo jerárquicos en cuatro niveles:

* **L3** → nivel estratégico superior
* **L2** → nivel táctico alto
* **L1** → nivel táctico medio
* **L0** → nivel operativo inferior

### ¿Qué modela?

* **Workflows multinivel** compuestos por estados (status) con sus dependencias
* **Jerarquías padre-hijo** entre workitems de distintos niveles
* **Propagación de reglas** entre niveles: cómo el avance en niveles inferiores impacta a los superiores y viceversa

### ¿Cómo funciona?

La simulación avanza mediante pasos discretos (ticks), de forma manual (botón Step) o continua (Autoplay). En cada tick, los workitems pueden avanzar al siguiente estado de su workflow respetando las reglas jerárquicas y de consistencia definidas.

La visualización principal es un **panel de cuatro tableros Kanban apilados verticalmente**, uno por nivel, con columnas que representan estados y tarjetas que representan workitems.

### Propósito

Es una herramienta educativa y de análisis para entender la dinámica de sistemas ágiles complejos con múltiples niveles de trabajo, visualizando conceptos Kanban como upstream/downstream, puntos de compromiso y puntos de entrega en un contexto multi-nivel.

### Configurabilidad

El sistema soporta **múltiples simulaciones** definidas en un archivo JSON (`defaultConfig.json`). Cada simulación tiene su propio conjunto de workflows, parámetros y nombres de estados. El usuario puede seleccionar la simulación activa desde la interfaz. Las reglas del motor de simulación son genéricas y funcionan con cualquier configuración de simulación válida.

---

## 🎯 2. Objetivos

* Visualizar flujos Kanban multi-nivel en paralelo
* Simular progresión de trabajo con reglas realistas
* Identificar cuellos de botella y dependencias
* Representar restricciones jerárquicas (padre-hijo)
* Servir como herramienta educativa y de análisis

---

## 🧩 3. Modelo de Dominio

### 3.1 Niveles de Tableros y de Workitems

* Cada simulación tiene cuatro niveles: L3 (superior), L2, L1 y L0 (inferior).
* Cada nivel tiene un tablero del workflow asociado al nivel, con su respectiva configuración de estados y reglas.
* Cada nivel tiene un tipo de workitem asociado, con su respectiva descripción y nivel de abstracción.

La configuración de la simulación "Simplified" es:

| Nivel | Nombre   | Descripción                  | Alcance del Nivel |
| ----- | -------- | ---------------------------- | ----------------- |
| L3    | Project  | Iniciativa estratégica       | Portfolio         |
| L2    | Epic     | Entrega de valor mayor       | Estratégico       |
| L1    | Story    | Funcionalidad del sistema    | Táctico           |
| L0    | Subtask  | Unidad implementable         | Operativo         |


---

### 3.2 Workitems

#### 3.2.1 Workitem Type (workitemType)

* Los workitems son de cuatro tipos: L0, L1, L2 y L3.
* Cada workitemType tiene un color asociado en la UI: L3=violeta, L2=azul, L1=naranja, L0=verde.

#### 3.2.2 Workitem (workitem)

* Cada workitem tiene un ID único. El formato es:
  `[Primeras 4 letras del workitemName en mayúsculas]-[número incremental]p[ID base del padre]`
  * El segmento `pXXXX-N` se agrega solo si el workitem tiene padre; los workitems L3 no tienen padre.
  * Ejemplos con `workitemName = "Project"` / `"Epic"` / `"Story"` / `"Subtask"`:
    * `PROJ-1` (L3, sin padre)
    * `EPIC-1pPROJ-1` (L2, hijo de PROJ-1)
    * `STOR-2pEPIC-1` (L1, hijo de EPIC-1)
    * `SUBT-3pSTOR-2` (L0, hijo de STOR-2)
  * El prefijo se toma del campo `workitemName` definido en el workflow del nivel correspondiente.
* Cada workitem tiene un estado (status) que representa su posición actual en el workflow.
* Cada workitem tiene una referencia a su padre (parentId) para modelar la jerarquía. Los workitems L3 no tienen padre; cada nivel contiene workitems hijos del nivel inmediatamente inferior.

---

## 🔄 4. Workflows

Cada simulación define sus propios workflows para los cuatro niveles. Los workflows incluidos en la configuración inicial son:

### 4.1 Simulación "Simplified"

Flujo simplificado de 4 estados por nivel:

| Nivel | Workflow |
| ----- | -------- |
| L3 — Project | `Backlog → Committed → In-Progress → Done` |
| L2 — Epic    | `Backlog → Committed → In-Progress → Done` |
| L1 — Story   | `Backlog → Committed → In-Progress → Done` |
| L0 — Subtask | `Backlog → Committed → In-Progress → Done` |

* `isBeforeCommitmentPoint`: **Committed** (estado inmediatamente anterior al commitment point)
* `isPosDeliveryPoint`: **Done** (estado final downstream)
* WIP limits activos: In-Progress de L3 (wipLimit=1), In-Progress de L2 (wipLimit=1)

---

### 4.2 Simulación "SDF workflows"

Flujos detallados que modelan un proceso de desarrollo complejo:

**L3 — Project:**
```
Draft → Discovery → Approved → Planned → In-Development → Measuring-Results → Finished
```
* Upstream: `Draft → Discovery → Approved`
* `isBeforeCommitmentPoint`: **Planned** (inmediatamente anterior al commitment point)
* Downstream: `Planned → In-Development → Measuring-Results → Finished`
* `isPosDeliveryPoint`: **Finished**
* WIP limits activos: In-Development (wipLimit=1)

**L2 — Release:**
```
Initial → Defining → Plan → Ready → Develop → To-Validate → Validation-UAT → Ready-for-Prod → Deploy → Released
```
* Upstream: `Initial → Defining → Plan → Ready`
* `isBeforeCommitmentPoint`: **Ready** (inmediatamente anterior al commitment point)
* Downstream: `Develop → To-Validate → Validation-UAT → Ready-for-Prod → Deploy → Released`
* `isPosDeliveryPoint`: **Released**
* WIP limits activos: Develop (wipLimit=1)

**L1 — Feat:**
```
Pending → Refining → Ready-for-Develop → Developing → Code-Review → QA-Validation → Acceptance → Done
```
* Upstream: `Pending → Refining → Ready-for-Develop`
* `isBeforeCommitmentPoint`: **Ready-for-Develop** (inmediatamente anterior al commitment point)
* Downstream: `Developing → Code-Review → QA-Validation → Acceptance → Done`
* `isPosDeliveryPoint`: **Done**

**L0 — Spec:**
```
Todo → Specifying → Designing → Ready-for-Implement → Implementing → Validation → Completed
```
* Upstream: `Todo → Specifying → Designing → Ready-for-Implement`
* `isBeforeCommitmentPoint`: **Ready-for-Implement** (inmediatamente anterior al commitment point)
* Downstream: `Implementing → Validation → Completed`
* `isPosDeliveryPoint`: **Completed**

---

### 4.3 Propiedades de cada estado (status)

Cada estado de un workflow tiene los siguientes atributos:

| Propiedad | Tipo | Descripción |
| --------- | ---- | ----------- |
| `id` | string | Identificador único del estado |
| `name` | string | Nombre visible en la UI |
| `order` | number | Posición secuencial en el workflow |
| `streamType` | `UPSTREAM` \| `DOWNSTREAM` | Zona del workflow |
| `isBeforeCommitmentPoint` | boolean | `true` en el estado inmediatamente anterior al commitment point; en ese estado se crean los hijos |
| `isPosDeliveryPoint` | boolean | `true` en el estado final del workflow (punto de entrega) |
| `wipLimit` | number? | Límite de WIP para esa columna. Si está definido, el motor impide que más workitems de los permitidos ocupen ese estado simultáneamente |
| `category` | `TODO` \| `IN_PROGRESS` \| `DONE` | Derivado automáticamente de `streamType` e `isPosDeliveryPoint` |

### 4.4 Propiedades de cada workflow

Cada workflow tiene los siguientes atributos:

| Propiedad | Tipo | Descripción |
| --------- | ---- | ----------- |
| `id` | string | Identificador único del workflow |
| `name` | string | Nombre visible en la UI (encabezado del tablero) |
| `level` | `L0` \| `L1` \| `L2` \| `L3` | Nivel jerárquico al que pertenece |
| `workitemName` | string | Nombre del tipo de workitem (ej: `"Story"`). Las primeras 4 letras en mayúsculas se usan como prefijo de ID |
| `statuses` | Status[] | Lista ordenada de estados del workflow |

---

## ⚙️ 5. Reglas de Negocio

Las reglas de negocio son **genéricas**: no dependen de nombres de estados específicos sino de las propiedades estructurales del workflow (`isBeforeCommitmentPoint`, `isPosDeliveryPoint`, `streamType`). Esto permite que el motor de simulación funcione con cualquier configuración de simulación.

El motor ejecuta **7 pasos en orden fijo** en cada tick. Cada paso opera sobre el estado de items producido por el paso anterior.

### 5.1 Paso 1 — L0 avanza de forma autónoma

* Los workitems de nivel L0 avanzan con probabilidad configurable (por defecto 50%) en cada tick.
* Se detienen al alcanzar `isPosDeliveryPoint`.
* No dependen de ningún otro workitem.
* Respetan el `wipLimit` de la columna destino.

---

### 5.2 Paso 2 — L1 se activa cuando L0 comienza a trabajar

* Cuando algún hijo L0 entra a cualquier estado con `streamType: DOWNSTREAM`, el padre L1 salta directamente a su primer estado downstream.
* Si la columna destino tiene `wipLimit`, el salto solo ocurre si hay capacidad disponible.

---

### 5.3 Paso 3 — L1 avanza con reglas jerárquicas

* **Upstream (antes de `isBeforeCommitmentPoint`)**: avanza autónomamente al 50%.
* **En `isBeforeCommitmentPoint`**: se crean los hijos L0 (si no existen aún), en el primer estado del workflow L0. Luego avanza autónomamente al 50%.
* **En el primer estado downstream**: **bloqueado** hasta que **todos** sus hijos L0 estén en `isPosDeliveryPoint`. Cuando se cumple, avanza.
* **Después del primer downstream**: avanza autónomamente al 50%.
* **En `isPosDeliveryPoint`**: se detiene.
* Todas las transiciones respetan el `wipLimit` de la columna destino.

---

### 5.4 Paso 4 — L2 se activa cuando L1 comienza a trabajar

* Idéntico al Paso 2 pero un nivel arriba: cuando algún hijo L1 entra a downstream, el padre L2 salta a su primer estado downstream.
* Respeta el `wipLimit` de la columna destino.

---

### 5.5 Paso 5 — L2 avanza con reglas jerárquicas

* Idéntico al Paso 3 pero para L2 con sus hijos L1:
* **En `isBeforeCommitmentPoint`**: crea hijos L1 (si no existen), luego avanza autónomamente al 50%.
* **En el primer estado downstream**: **bloqueado** hasta que todos los hijos L1 estén en `isPosDeliveryPoint`.
* **Resto**: autónomo o detenido en entrega.
* Todas las transiciones respetan el `wipLimit` de la columna destino.

---

### 5.6 Paso 6 — L3 se activa cuando L2 comienza a trabajar

* Idéntico al Paso 2 pero para L3: cuando algún hijo L2 entra a downstream, el padre L3 salta a su primer estado downstream.
* Respeta el `wipLimit` de la columna destino.

---

### 5.7 Paso 7 — L3 avanza con reglas jerárquicas

* Idéntico al Paso 3 pero para L3 con sus hijos L2:
* **En `isBeforeCommitmentPoint`**: crea hijos L2 (si no existen), luego avanza autónomamente al 50%.
* **En el primer estado downstream**: **bloqueado** hasta que todos los hijos L2 estén en `isPosDeliveryPoint`.
* **Resto**: autónomo o detenido en entrega.
* Todas las transiciones respetan el `wipLimit` de la columna destino.

---

### 5.8 Reglas Globales

* **Progresión secuencial**: cada workitem avanza estado por estado sin saltos (salvo el salto forzado al primer downstream en pasos 2, 4 y 6).
* **Máximo una transición por tick**: un workitem puede avanzar como máximo un estado por tick.
* **Estado inicial**: los workitems L3 inician en el primer estado de su workflow; los workitems hijos creados también inician en el primer estado de su workflow.
* **Número de hijos**: configurable por simulación (por defecto: 3 hijos por padre).
* **WIP Limit**: cuando una columna tiene `wipLimit` definido, el motor lleva un contador mutable por tick que impide que más de N workitems ocupen esa columna al mismo tiempo, incluyendo las transiciones aprobadas durante el mismo tick.

---

### 5.9 Derivación automática de STATUS-CATEGORY

El campo `category` de cada estado se calcula automáticamente a partir de sus propiedades estructurales:

* `TODO` = todos los estados con `streamType: UPSTREAM`
* `IN_PROGRESS` = estados con `streamType: DOWNSTREAM` excepto el último
* `DONE` = el último estado del workflow (`isPosDeliveryPoint: true`)

Los colores representativos de STATUS-CATEGORY son: TODO=gris, IN-PROGRESS=azul, DONE=verde.

---

### 5.10 Punto de Compromiso (commitment-status)

El estado marcado con `isBeforeCommitmentPoint: true` es el estado previo al que el equipo se compromete formalmente a ejecutar el workitem. Ejemplos en la simulación "SDF workflows":

| Nivel | Nombre  | Estado con `isBeforeCommitmentPoint` | Significado                                    |
| ----- | ------- | ------------------------------------ | ---------------------------------------------- |
| L3    | Project | Planned                              | "Nos comprometemos a ejecutar este Project"    |
| L2    | Release | Ready                                | "Nos comprometemos a desarrollar este Release" |
| L1    | Feat    | Ready-for-Develop                    | "Nos comprometemos a implementar esta Feat"    |
| L0    | Spec    | Ready-for-Implement                  | "Nos comprometemos a codificar esta Spec"      |

---

## ⏱ 6. Modelo de Simulación

### 6.1 Motor de Simulación

* Simulación basada en pasos discretos (ticks)
* Cada tick representa una unidad de tiempo
* En la simulación automática (autoplay), los ticks avanzan automáticamente cada 1 segundo
* En cada tick:
  * Los workitems pueden o no avanzar (probabilístico)
  * Se evalúan reglas jerárquicas en 7 pasos ordenados
  * Se aplican restricciones de WIP

### 6.2 Componente Probabilístico

* En cada tick, cada workitem elegible tiene una **probabilidad del 50%** de avanzar al siguiente estado de su workflow.
* Un workitem es "elegible" si cumple todas las reglas de negocio aplicables (jerárquicas y de WIP).
* La probabilidad es uniforme para todos los workitems y estados (no varía por nivel ni por estado).
* Este valor es configurable via JSON (`advanceProbability`).

### 6.3 Estado Inicial de la Simulación

* La simulación inicia con **N workitems L3** (configurable, por defecto 1) en el **primer estado** del workflow L3.
* No existen workitems de otros niveles al inicio.
* Los workitems hijos se crean dinámicamente según las reglas de negocio (§5.3, §5.5, §5.7).
* La cantidad inicial de workitems L3 es configurable por simulación via JSON (`initialReleaseCount`).
* Al cambiar de simulación o presionar Reset, el estado vuelve a este punto inicial.

---

## 🖥 7. Interfaz de Usuario

### 7.1 Selector de Simulación

En el encabezado de la aplicación hay un **dropdown** que muestra la lista de simulaciones disponibles (cargadas desde `defaultConfig.json`). Al seleccionar una simulación:

* Se carga la configuración correspondiente (workflows L3, L2, L1, L0).
* El estado de simulación se resetea al estado inicial de la nueva simulación.
* El autoplay se detiene.

---

### 7.2 Layout General

Los cuatro tableros se presentan **verticalmente apilados** en la pantalla, reflejando la jerarquía del modelo:

```
┌──────────────────────────────────────┐
│  L3 Board  (ej: Project)             │
├──────────────────────────────────────┤
│  L2 Board  (ej: Epic)                │
├──────────────────────────────────────┤
│  L1 Board  (ej: Story)               │
├──────────────────────────────────────┤
│  L0 Board  (ej: Subtask)             │
└──────────────────────────────────────┘
```

Cada tablero:
* Tiene una solapa de encabezado con el nivel y el nombre del workflow (ej: `L2 — Epic`)
* Contiene columnas por estado
* Muestra tarjetas (workitems)
* Se actualiza en cada tick

Cada columna muestra en su encabezado:
* El nombre del estado
* El texto del encabezado está **subrayado** si el estado tiene `isBeforeCommitmentPoint: true`
* Si tiene `wipLimit` definido, muestra `[items actuales/límite]` (ej: `In-Progress [1/1]`)

---

### 7.3 Tarjetas (workitems)

Las tarjetas son la forma en que se renderiza un workitem en la UI. Cada tarjeta muestra:

* El ID del workitem (ej: `PROJ-1`, `EPIC-1pPROJ-1`, `STOR-2pEPIC-1`)
* El color del tipo de workitem: L3=violeta, L2=azul, L1=naranja, L0=verde

---

### 7.4 Características UI

* Diseño compacto (sin scroll horizontal)
* Columnas responsivas (wrap), ocupa el 100% del ancho del navegador
* Alta densidad de información

---

### 7.5 Botones de Acción

| Botón | Descripción |
| ----- | ----------- |
| **Step** | Avanza la simulación un tick manualmente |
| **Autoplay** | Ejecuta la simulación de forma continua (un tick por segundo). Vuelve a presionar para pausar |
| **Reset** | Resetea la simulación al estado inicial (N workitems L3 en el primer estado, sin hijos) |
| **Upstream vs Downstream** | Toggle: pinta las columnas upstream de un color y las downstream de otro |
| **Status Category** | Toggle: pinta las columnas según su statusCategory (TODO=gris, IN-PROGRESS=azul, DONE=verde) |
| **Commitment Status** | Toggle: resalta con fondo especial la columna con `isBeforeCommitmentPoint: true` de cada tablero |
| **Delivery Status** | Toggle: resalta con fondo y borde especial la columna con `isPosDeliveryPoint: true` de cada tablero |

**Comportamiento de los botones de vista:** Los cuatro botones de vista son **toggles mutuamente excluyentes** — activar uno desactiva automáticamente el anterior activo.

---

## ⚡ 8. Requerimientos Funcionales

### RF-01 — Simulación por pasos

El sistema debe permitir simular la evolución de workflows paso a paso.

**Criterios de aceptación:**
- Dado que la simulación está activa, cuando el usuario presiona "Step", entonces todos los workitems elegibles avanzan máximo un estado.
- Dado que la simulación está en autoplay, entonces los ticks avanzan automáticamente cada 1 segundo sin intervención del usuario.
- Dado que el usuario presiona "Reset", entonces la simulación vuelve al estado inicial.

---

### RF-02 — Cuatro tableros independientes

El sistema debe mostrar cuatro tableros Kanban independientes (L3, L2, L1, L0) apilados verticalmente.

**Criterios de aceptación:**
- Cada tablero muestra únicamente los workitems de su nivel correspondiente.
- Cada tablero se actualiza de forma independiente en cada tick.
- Los cuatro tableros son visibles simultáneamente sin scroll horizontal.

---

### RF-03 — Reglas jerárquicas entre workitems

El sistema debe respetar las reglas jerárquicas definidas entre niveles, basadas en las propiedades estructurales de cada workflow.

**Criterios de aceptación:**
- Un workitem en su primer estado downstream no puede avanzar mientras alguno de sus hijos no haya alcanzado `isPosDeliveryPoint`.
- Cuando el primer hijo de un workitem entra a downstream, el padre salta automáticamente a su primer estado downstream.
- Cuando todos los hijos de un workitem están en `isPosDeliveryPoint`, el padre avanza desde su primer downstream.

---

### RF-04 — Creación automática de workitems hijos

El sistema debe crear automáticamente workitems hijos según las reglas de negocio.

**Criterios de aceptación:**
- Cuando un workitem pasa por su estado `isBeforeCommitmentPoint`, se crean exactamente N hijos en el primer estado del workflow del nivel inferior (N configurable, por defecto 3).
- Los hijos se crean una sola vez (si ya existen no se vuelven a crear).
- Los IDs de los nuevos workitems siguen la nomenclatura definida.

---

### RF-05 — WIP Limits por columna

El sistema debe impedir que el número de workitems en una columna supere su `wipLimit` configurado.

**Criterios de aceptación:**
- Si una columna tiene `wipLimit` definido, ninguna transición hacia esa columna se aprueba si el conteo actual ya alcanzó el límite.
- El conteo es mutable dentro del tick: las aprobaciones del mismo tick se acumulan, evitando violaciones intra-tick.
- Las columnas con `wipLimit` muestran el conteo actual y el límite en su encabezado.

---

### RF-06 — Máximo una transición por tick

El sistema debe limitar el avance de cada workitem a una sola transición por tick.

**Criterios de aceptación:**
- Dado un workitem en estado X, después de un tick puede estar en X o en X+1, nunca en X+2 o posterior.
- Este límite aplica a todos los workitems de todos los niveles.

---

### RF-07 — Visualización del estado actual

El sistema debe reflejar visualmente el estado actual de cada workitem en tiempo real.

**Criterios de aceptación:**
- Cada tarjeta muestra el ID del workitem y su color de tipo.
- Después de cada tick, las tarjetas se reposicionan en la columna correcta.
- Los botones de vista colorean las columnas correctamente según su modo activo, y son mutuamente excluyentes.

---

### RF-08 — Selección de simulación

El sistema debe permitir al usuario seleccionar entre múltiples simulaciones disponibles.

**Criterios de aceptación:**
- La UI muestra un dropdown con la lista de simulaciones cargadas desde `defaultConfig.json`.
- Al seleccionar una simulación diferente, el estado de simulación se resetea y los tableros se actualizan con el nuevo workflow.
- La simulación por defecto está preseleccionada al cargar la aplicación.

---

## 🚀 9. Requerimientos No Funcionales

### RNF-01 Rendimiento

* La simulación debe ejecutarse en tiempo real (<16ms por tick en UI)

### RNF-02 Escalabilidad

* Debe soportar múltiples workitems L3 simultáneamente

### RNF-03 Usabilidad

* Interfaz clara, compacta y legible

### RNF-04 Mantenibilidad

* Código modular y tipado (TypeScript)

### RNF-05 Extensibilidad

* Debe permitir agregar nuevos workflows o reglas

### RNF-06 Consistencia

* El sistema nunca debe mostrar estados inválidos

### RNF-07 Configuración

* El sistema debe ser configurable mediante el archivo `defaultConfig.json`.
* La configuración define: las simulaciones disponibles, los workflows (estados, propiedades, WIP limits), y los parámetros de simulación (probabilidad, cantidad de hijos, número inicial de workitems L3).
* No se requiere UI para editar la configuración; se edita directamente el archivo JSON.

---

## 📊 10. Posibles Extensiones

* Métricas (lead time, cycle time)
* Configuración de demanda (cantidad de workitems creados automáticamente)
* Animaciones entre columnas
* Highlight de dependencias entre workitems
* Exportación de datos de simulación
* Editor visual de configuración
* Exportación de archivo de configuración JSON

---

## 🧠 11. Consideraciones Técnicas

### 11.1 Stack Tecnológico

| Tecnología    | Uso                                       |
| ------------- | ----------------------------------------- |
| React + Vite  | Framework UI y bundler                    |
| TypeScript    | Tipado estático en toda la aplicación     |
| useState      | Estado local de la simulación             |

### 11.2 Estructura de Módulos

```
src/
├── config/
│   ├── defaultConfig.json      # Fuente de verdad: simulaciones, workflows, parámetros
│   └── defaultConfig.ts        # Carga y procesa el JSON; asigna category automáticamente
├── domain/
│   └── types.ts                # Tipos TypeScript: Workitem, Workflow, Status, SimState, Config, etc.
├── simulation/
│   └── engine.ts               # Motor de simulación: buildInitialState() y tick() (funciones puras)
├── components/
│   ├── Board.tsx               # Tablero de un nivel
│   ├── Column.tsx              # Columna (estado del workflow)
│   └── Card.tsx                # Tarjeta (workitem)
└── App.tsx                     # Composición principal, estado global y controles de UI
```

### 11.3 Decisiones de Diseño

* **Función pura para el tick:** `tick(state, config) → state` en `engine.ts` es una función pura sin efectos secundarios. Facilita el testing, la reproducibilidad y el autoplay con `setInterval`.
* **Motor generalizado:** Las reglas del engine se basan en las propiedades estructurales del workflow (`isBeforeCommitmentPoint`, `isPosDeliveryPoint`, `streamType`), no en IDs de estados. Esto permite usar cualquier simulación definida en el JSON sin modificar el código del motor.
* **Configuración en JSON:** Todas las simulaciones, workflows y parámetros se definen en `defaultConfig.json`. `defaultConfig.ts` solo carga el JSON y deriva el campo `category` automáticamente.
* **Múltiples simulaciones:** El JSON soporta un array de simulaciones con un campo `defaultSimulation`. La UI permite seleccionar entre ellas desde un dropdown.
* **WIP Tracker mutable:** `makeWipTracker` crea un contador por paso del tick. Cada transición aprobada incrementa el contador, evitando que múltiples workitems pasen el mismo límite en el mismo tick.
* **Prefijos de ID desde workitemName:** El prefijo de 4 letras para los IDs se deriva del campo `workitemName` del workflow, sin valores hardcodeados en el motor.

---

## ✅ 12. Definición de Done

* Todos los workflows implementados correctamente en los cuatro niveles
* Reglas respetadas sin inconsistencias
* WIP limits aplicados correctamente
* UI funcional sin scroll horizontal
* Simulación estable (sin loops inválidos)
* Código tipado y mantenible

---

## 📖 13. Glosario

| Término                  | Definición |
| ------------------------ | ---------- |
| **Tick**                 | Unidad mínima de tiempo en la simulación. En cada tick, los workitems elegibles pueden avanzar un estado. |
| **Workitem**             | Unidad de trabajo dentro de la simulación. Tiene un nivel (L0–L3), un estado y opcionalmente un padre. |
| **Workflow**             | Secuencia ordenada de estados por la que pasan los workitems de un nivel. |
| **Status**               | Estado individual dentro de un workflow (ej: Developing, Completed). |
| **statusCategory**       | Categoría de un estado: TODO (pendiente), IN-PROGRESS (en curso) o DONE (terminado). Derivada automáticamente. |
| **Upstream**             | Zona del workflow antes del commitment point. Representa actividades de exploración y preparación. |
| **Downstream**           | Zona del workflow a partir del commitment point. Representa ejecución activa. |
| **isBeforeCommitmentPoint** | Propiedad de un estado que indica que es el estado inmediatamente anterior al commitment point. En ese estado se crean los workitems hijos. |
| **isPosDeliveryPoint**   | Propiedad de un estado que indica que es el estado final del workflow (punto de entrega). El workitem se detiene aquí. |
| **wipLimit**             | Límite máximo de workitems permitidos simultáneamente en una columna. Se define por estado en el JSON. |
| **workitemName**         | Nombre del tipo de workitem definido en el workflow. Sus primeras 4 letras en mayúsculas forman el prefijo de los IDs. |
| **Jerarquía padre-hijo** | Relación entre workitems de distintos niveles: L3 contiene L2, L2 contiene L1, L1 contiene L0. |
| **Autoplay**             | Modo de simulación continua donde los ticks avanzan automáticamente a intervalos regulares. |
| **Step**                 | Modo de simulación manual donde el usuario avanza la simulación un tick a la vez. |

---

# 🎯 Resultado

Este sistema permite modelar de forma realista:

* Sistemas ágiles complejos con jerarquías de cuatro niveles
* Dependencias entre niveles y flujo de valor de abajo hacia arriba
* Restricciones de capacidad mediante WIP limits por columna

---
