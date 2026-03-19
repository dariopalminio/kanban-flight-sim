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
   - [5.6 Reglas Globales](#56-reglas-globales)
6. [Modelo de Simulación](#6-modelo-de-simulación)
7. [Interfaz de Usuario](#7-interfaz-de-usuario)
   - [7.1 Selector de Simulación](#71-selector-de-simulación)
   - [7.2 Layout General](#72-layout-general)
8. [Requerimientos Funcionales](#8-requerimientos-funcionales)
9. [Requerimientos No Funcionales](#9-requerimientos-no-funcionales)
10. [Posibles Extensiones](#10-posibles-extensiones)
11. [Consideraciones Técnicas](#11-consideraciones-técnicas)
12. [Definición de Done](#12-definición-de-done)
13. [Glosario](#13-glosario)

---

## 📌 1. Descripción General

El **Simulador de Vuelo Kanban (KanbanFlightSim)** es una aplicación frontend que simula visualmente flujos de trabajo jerárquicos en tres niveles:

* **L2: Release** → nivel estratégico superior
* **L1: Feat** → nivel táctico medio
* **L0: Spec** → nivel operativo bajo o inferior

### ¿Qué modela?

* **Workflows multinivel** compuestos por estados (status) con sus dependencias
* **Jerarquías padre-hijo** entre workitems de distintos niveles
* **Propagación de reglas** entre niveles: cómo el avance en niveles inferiores impacta a los superiores y viceversa

### ¿Cómo funciona?

La simulación avanza mediante pasos discretos (ticks), de forma manual (botón Step) o continua (Autoplay). En cada tick, los workitems pueden avanzar al siguiente estado de su workflow respetando las reglas jerárquicas y de consistencia definidas.

La visualización principal es un **panel de tres tableros Kanban apilados verticalmente**, uno por nivel, con columnas que representan estados y tarjetas que representan workitems.

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

* En una simulación y configuración existe solo tres niveles: nivel 2 (L2), nivel 1 (L1) y nivel 0 (L0).
* Cada nivel tiene un tablero del workflow asociado al nivel, con su respectiva configuración de estados y reglas.
* Cada nivel tiene un tipo de workitem asociado, con su respectiva descripción y nivel de abstracción.

La configuración inicial y por defecto es la siguiente:

| Nivel | Nombre    | Descripción                  | Alcance del Nivel |
| ----- | --------- | ---------------------------- | ----------------- |
| L2    | Release   | Entrega completa del sistema | Estratégico       |
| L1    | Feat      | Funcionalidad del sistema    | Táctico           |
| L0    | Spec      | Unidad implementable         | Operativo         |

---

### 3.2 Workitems

#### 3.2.1 Workitem Type (workitemType)

* Los workitems son de tres tipos: L0, L1, y L2.
* En el caso del ejemplo inicial los Workitems son: L2=Release, L1=Feat y L0=Spec.
* Cada workitemType tiene un color asociado, cada una con su color representativo: L2=azul, L1=naranja y L0=verde respectivamente.

#### 3.2.2 Workitem (workitem)

* Cada workitem tiene su ID. Los IDs de workitems siguen una nomenclatura `[Primeras tres letras del nombre del tipo de workitem]-[ID numérico incremental por tipo]`, por ejemplo:
   * Workitem type=Release → RELE-1, RELE-2, RELE-3, ...
   * Workitem type=Feat → FEAT-1, FEAT-2, FEAT-3, ...
   * Workitem type=Spec → SPEC-1, SPEC-2, SPEC-3, ...
* Cada workitem tiene un estado (status) que representa su posición actual en el workflow.
* Cada workitem tiene una referencia a su padre (parentId) y a sus hijos (children) para modelar la jerarquía. Los workitems del nivel 2 no tienen padre, los del nivel 1 tienen un padre del nivel 2 e hijos del nivel 0, y los del nivel 0 tienen un padre del nivel 1 y no tienen hijos.
* Cada workitem tiene un tipo (workitemType) que indica si es L2, L1 o L0 (en el ejemplo de configuración inicial: Release, Feat o Spec).

---

## 🔄 4. Workflows

Cada simulación define sus propios workflows. Los workflows incluidos en la configuración inicial son:

### 4.1 Simulación "Simplified"

Flujo simplificado de 4 estados por nivel:

| Nivel | Workflow |
| ----- | -------- |
| L2 — Epic | `Backlog → Committed → In-Progress → Done` |
| L1 — Story    | `Backlog → Committed → In-Progress → Done` |
| L0 — Subtask    | `Backlog → Committed → In-Progress → Done` |

* Commitment point: **Committed** (upstream)
* Delivery point: **Done** (downstream final)

---

### 4.2 Simulación "SDF workflows"

Flujos detallados que modelan un proceso de desarrollo complejo:

**L2 — Release:**
```txt
Initial → Defining → Plan → Ready → Develop → To-Validate → Validation-UAT → Ready-for-Prod → Deploy → Released
```
* Upstream: `Initial → Defining → Plan → Ready`
* Commitment point: **Ready**
* Downstream: `Develop → To-Validate → Validation-UAT → Ready-for-Prod → Deploy → Released`
* Delivery point: **Released**

**L1 — Feat:**
```txt
Pending → Refining → Ready-for-Develop → Developing → Code-Review → QA-Validation → Acceptance → Done
```
* Upstream: `Pending → Refining → Ready-for-Develop`
* Commitment point: **Ready-for-Develop**
* Downstream: `Developing → Code-Review → QA-Validation → Acceptance → Done`
* Delivery point: **Done**

**L0 — Spec:**
```txt
Todo → Specifying → Designing → Ready-for-Implement → Implementing → Validation → Completed
```
* Upstream: `Todo → Specifying → Designing → Ready-for-Implement`
* Commitment point: **Ready-for-Implement**
* Downstream: `Implementing → Validation → Completed`
* Delivery point: **Completed**

---

### 4.3 Propiedades de cada estado (status)

Cada estado de un workflow tiene los siguientes atributos:

| Propiedad | Tipo | Descripción |
| --------- | ---- | ----------- |
| `id` | string | Identificador único del estado |
| `name` | string | Nombre visible en la UI |
| `order` | number | Posición secuencial en el workflow |
| `streamType` | `UPSTREAM` \| `DOWNSTREAM` | Zona del workflow |
| `isBeforeCommitmentPoint` | boolean | Indica el punto de compromiso del nivel |
| `isPosDeliveryPoint` | boolean | Indica el estado final (entrega) del nivel |
| `category` | `TODO` \| `IN_PROGRESS` \| `DONE` | Derivado automáticamente de las propiedades anteriores |

---

## ⚙️ 5. Reglas de Negocio

Las reglas de negocio son **genéricas**: no dependen de nombres de estados específicos sino de las propiedades estructurales del workflow (`isBeforeCommitmentPoint`, `isPosDeliveryPoint`, `streamType`). Esto permite que el motor de simulación funcione con cualquier configuración de simulación.

### 5.1 Paso 1 — L0 avanza de forma autónoma

* Los workitems de nivel L0 avanzan con probabilidad configurable (por defecto 50%) en cada tick.
* Se detienen al alcanzar su estado final o `isPosDeliveryPoint`.
* No dependen de ningún otro workitem.

---

### 5.2 Paso 2 — L1 se activa cuando L0 comienza a trabajar

* Cuando algún hijo L0 entra a cualquier estado con `streamType: DOWNSTREAM`, el padre L1 salta directamente a su primer estado downstream (`streamType: DOWNSTREAM`).
* Esto activa al padre automáticamente cuando el trabajo real en L0 comienza.

---

### 5.3 Paso 3 — L1 avanza con reglas jerárquicas

* **Antes del `isBeforeCommitmentPoint`** (upstream): avanza autónomamente al 50%.
* **En el `isBeforeCommitmentPoint`**: se crean los hijos L0 (si no existen), con su primer estado del workflow L0. Luego avanza autónomamente al 50%.
* **En el primer estado downstream** (`streamType: DOWNSTREAM`): **bloqueado** hasta que **todos** sus hijos L0 estén en `isPosDeliveryPoint`. Cuando se cumple, avanza.
* **Después del primer downstream**: avanza autónomamente al 50%.
* **En `isPosDeliveryPoint`**: se detiene.

---

### 5.4 Paso 4 — L2 se activa cuando L1 comienza a trabajar

* Idéntico al Paso 2 pero un nivel arriba: cuando algún hijo L1 entra a downstream, el padre L2 salta a su primer estado downstream.

---

### 5.5 Paso 5 — L2 avanza con reglas jerárquicas

* Idéntico al Paso 3 pero para L2 con sus hijos L1:
* **En `isBeforeCommitmentPoint`**: crea hijos L1, luego avanza autónomamente al 50%.
* **En primer downstream**: **bloqueado** hasta que todos los hijos L1 estén en `isPosDeliveryPoint`.
* **Resto**: autónomo o detenido en entrega.

---

### 5.6 Reglas Globales

* **Progresión secuencial**: cada workitem avanza estado por estado sin saltos.
* **Máximo una transición por tick**: un workitem puede avanzar como máximo un estado por tick.
* **Estado inicial**: los workitems de L2 inician en el primer estado de su workflow; los workitems hijos creados también inician en el primer estado de su workflow.
* **Número de hijos**: configurable por simulación (por defecto: 3 hijos por padre).

---

### 5.7 Derivación automática de STATUS-CATEGORY

El campo `category` de cada estado se calcula automáticamente a partir de sus propiedades estructurales:

* `TODO` = todos los estados con `streamType: UPSTREAM`
* `IN_PROGRESS` = estados con `streamType: DOWNSTREAM` excepto el último
* `DONE` = el estado con `isPosDeliveryPoint: true`

Los colores representativos de STATUS-CATEGORY son: TODO=gris, IN-PROGRESS=azul, DONE=verde.

---

### 5.8 Punto de Compromiso (commitment-status)

El `isBeforeCommitmentPoint` de cada nivel define el momento en que el equipo se compromete formalmente a ejecutar el workitem y se crean sus hijos. Ejemplos en la simulación "SDF workflows":

| Nivel | Nombre  | commitment-status    | Significado                                    |
| ----- | ------- | -------------------- | ---------------------------------------------- |
| L2    | Release | Ready                | "Nos comprometemos a desarrollar este Release" |
| L1    | Feat    | Ready-for-Develop    | "Nos comprometemos a implementar esta Feat"    |
| L0    | Spec    | Ready-for-Implement  | "Nos comprometemos a codificar esta Spec"      |

---

## ⏱ 6. Modelo de Simulación

### 6.1 Motor de Simulación

* Simulación basada en pasos discretos (ticks)
* Cada tick representa una unidad de tiempo
* En la simulación automática (autoplay), los ticks avanzan automáticamente cada cierto intervalo configurable (por defecto: 1 segundo)
* En cada tick:

  * Los workitems pueden o no avanzar (probabilístico)
  * Se evalúan reglas jerárquicas
  * Se aplican restricciones de consistencia

### 6.2 Componente Probabilístico

* En cada tick, cada workitem elegible tiene una **probabilidad del 50%** de avanzar al siguiente estado de su workflow.
* Un workitem es "elegible" si cumple todas las reglas de negocio aplicables (jerárquicas y de consistencia).
* La probabilidad es uniforme para todos los workitems y estados (no varía por nivel ni por estado).
* Este valor es configurable via JSON.

### 6.3 Estado Inicial de la Simulación

* La simulación inicia con **N Releases** (configurable, por defecto 1) en el **primer estado** del workflow L2.
* No existen Feats ni Specs al inicio.
* Los workitems hijos se crean dinámicamente según las reglas de negocio (§5.3, §5.5).
* La cantidad inicial de Releases es configurable por simulación via JSON.
* Al cambiar de simulación o presionar Reset, el estado vuelve a este punto inicial.

---

## 🖥 7. Interfaz de Usuario

### 7.1 Selector de Simulación

En el encabezado de la aplicación hay un **dropdown** que muestra la lista de simulaciones disponibles (cargadas desde `defaultConfig.json`). Al seleccionar una simulación:

* Se carga la configuración correspondiente (workflows L2, L1, L0).
* El estado de simulación se resetea al estado inicial de la nueva simulación.
* El autoplay se detiene.

---

### 7.2 Layout General

Los tres tableros se presentan **verticalmente apilados** en la pantalla, reflejando la jerarquía del modelo:

```
┌──────────────────────────────────────┐
│  🟦 Level-2 (Release) Board          │
├──────────────────────────────────────┤
│  🟨 Level-1 (Feat) Board             │
├──────────────────────────────────────┤
│  🟩 Level-0 (Spec) Board             │
└──────────────────────────────────────┘
```

Cada tablero:

* Contiene columnas por estado
* Muestra tarjetas (workitems)
* Se actualiza en cada tick

Cada estado (status) tiene los siguientes atributos:
   * `statusCategory`: TODO, IN-PROGRESS o DONE.
   * `streamType`: UPSTREAM o DOWNSTREAM.
   * `isCommitmentStatus`: booleano que indica si es un punto de compromiso.
   * `isDeliveryStatus`: booleano que indica si es un punto de entrega.

### 7.3 Tarjetas (workitems)

Las tarjetas son la forma en que se renderiza un workitem en la UI. Cada tarjeta muestra:

* El ID del workitem (ej: RELE-1, FEAT-2, SPEC-3)
* El color del tipo de workitem (L2=azul, L1=naranja, L0=verde)

---

### 7.4 Características UI

* Diseño compacto (sin scroll horizontal)
* Columnas responsivas (wrap)
* Alta densidad de información

---

### 7.5 Botones de Acción

| Botón | Descripción |
| ----- | ----------- |
| **Step** | Avanza la simulación un tick manualmente |
| **Autoplay** | Ejecuta la simulación de forma continua (un tick por segundo). Vuelve a presionar para pausar |
| **Reset** | Resetea la simulación al estado inicial (1 Release en Initial, sin Feats ni Specs) |
| **Upstream vs Downstream** | Toggle: pinta las columnas upstream de un color y las downstream de otro |
| **Status Category** | Toggle: pinta las columnas según su statusCategory (TODO=gris, IN-PROGRESS=azul, DONE=verde) |
| **Commitment Status** | Toggle: resalta con borde/fondo especial la columna de commitment-status de cada tablero |
| **Delivery Status** | Toggle: resalta con borde/fondo especial la columna de delivery-status de cada tablero |

**Comportamiento de los botones de vista:** Los cuatro botones de vista (Upstream/Downstream, Status Category, Commitment Status, Delivery Status) son **toggles mutuamente excluyentes** — activar uno desactiva automáticamente el anterior activo.

---

## ⚡ 8. Requerimientos Funcionales

### RF-01 — Simulación por pasos

El sistema debe permitir simular la evolución de workflows paso a paso.

**Criterios de aceptación:**
- Dado que la simulación está activa, cuando el usuario presiona "Step", entonces todos los workitems elegibles avanzan máximo un estado.
- Dado que la simulación está en autoplay, entonces los ticks avanzan automáticamente cada 1 segundo sin intervención del usuario.
- Dado que el usuario presiona "Reset", entonces la simulación vuelve al estado inicial (1 Release en Initial, sin Feats ni Specs).

---

### RF-02 — Tres tableros independientes

El sistema debe mostrar tres tableros Kanban independientes (Release, Feat, Spec) apilados verticalmente.

**Criterios de aceptación:**
- Cada tablero muestra únicamente los workitems de su nivel correspondiente.
- Cada tablero se actualiza de forma independiente en cada tick.
- Los tres tableros son visibles simultáneamente sin scroll horizontal.

---

### RF-03 — Reglas jerárquicas entre workitems

El sistema debe respetar las reglas jerárquicas definidas entre niveles, basadas en las propiedades estructurales de cada workflow.

**Criterios de aceptación:**
- Un workitem L1 en su primer estado downstream no puede avanzar mientras alguno de sus hijos L0 no haya alcanzado su `isPosDeliveryPoint`.
- Cuando el primer hijo L0 de un L1 entra a downstream, el L1 padre salta automáticamente a su primer estado downstream.
- Cuando el primer hijo L1 de un L2 entra a downstream, el L2 padre salta automáticamente a su primer estado downstream.
- Cuando todos los hijos L1 de un L2 están en `isPosDeliveryPoint`, el L2 avanza desde su primer downstream.

---

### RF-04 — Creación automática de workitems hijos

El sistema debe crear automáticamente workitems hijos según las reglas de negocio.

**Criterios de aceptación:**
- Cuando un L2 pasa por su `isBeforeCommitmentPoint`, se crean exactamente N hijos L1 en el primer estado del workflow L1 (N configurable, por defecto 3).
- Cuando un L1 pasa por su `isBeforeCommitmentPoint`, se crean exactamente N hijos L0 en el primer estado del workflow L0.
- Los hijos se crean una sola vez (si ya existen no se vuelven a crear).
- Los IDs de los nuevos workitems siguen la nomenclatura definida (ej: FEAT-1, SPEC-4).

---

### RF-05 — Consistencia de estados

El sistema debe impedir que los workitems lleguen a estados inválidos.

**Criterios de aceptación:**
- Un workitem nunca omite estados intermedios (avance secuencial obligatorio).
- Una Feat en estado posterior a Developing no puede existir si alguna de sus Specs no está en Completed.
- El sistema no permite transiciones que violen las reglas de negocio definidas en §5.

---

### RF-06 — Máximo una transición por tick

El sistema debe limitar el avance de cada workitem a una sola transición por tick.

**Criterios de aceptación:**
- Dado un workitem en estado X, después de un tick puede estar en X o en X+1, nunca en X+2 o posterior.
- Este límite aplica a todos los workitems de todos los niveles.

---

### RF-08 — Selección de simulación

El sistema debe permitir al usuario seleccionar entre múltiples simulaciones disponibles.

**Criterios de aceptación:**
- La UI muestra un dropdown con la lista de simulaciones cargadas desde `defaultConfig.json`.
- Al seleccionar una simulación diferente, el estado de simulación se resetea y los tableros se actualizan con el nuevo workflow.
- La simulación por defecto está preseleccionada al cargar la aplicación.

---

### RF-07 — Visualización del estado actual

El sistema debe reflejar visualmente el estado actual de cada workitem en tiempo real.

**Criterios de aceptación:**
- Cada tarjeta muestra el ID del workitem y su color de tipo.
- Después de cada tick, las tarjetas se reposicionan en la columna correcta.
- Los botones de vista colorean las columnas correctamente según su modo activo, y son mutuamente excluyentes.

---

## 🚀 9. Requerimientos No Funcionales

### RNF-01 Rendimiento

* La simulación debe ejecutarse en tiempo real (<16ms por tick en UI)

### RNF-02 Escalabilidad

* Debe soportar múltiples Releases simultáneamente

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
* La configuración define: las simulaciones disponibles, los workflows (estados, propiedades), y los parámetros de simulación (probabilidad, cantidad de hijos, número inicial de releases).
* No se requiere UI para editar la configuración; se edita directamente el archivo JSON.

---

## 📊 10. Posibles Extensiones

* Métricas (lead time, cycle time)
* Configuración de demanda (cantidad de workitems creados automáticamente).
* WIP limits por columna
* Animaciones entre columnas
* Highlight de dependencias entre workitems
* Exportación de datos de simulación
* Editor visual de configuración (los estados de los workfow por nivel, nombre de niveles,reglas, parámetros)
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

---

## ✅ 12. Definición de Done

* Todos los workflows implementados correctamente
* Reglas respetadas sin inconsistencias
* UI funcional sin scroll horizontal
* Simulación estable (sin loops inválidos)
* Código tipado y mantenible

---

## 📖 13. Glosario

| Término                  | Definición |
| ------------------------ | ---------- |
| **Tick**                 | Unidad mínima de tiempo en la simulación. En cada tick, los workitems elegibles pueden avanzar un estado. |
| **Workitem**             | Unidad de trabajo dentro de la simulación. Puede ser un Release (L2), Feat (L1) o Spec (L0). |
| **Workflow**             | Secuencia ordenada de estados por la que pasan los workitems de un nivel. |
| **Status**               | Estado individual dentro de un workflow (ej: Developing, Completed). |
| **statusCategory**       | Categoría de un estado: TODO (pendiente), IN-PROGRESS (en curso) o DONE (terminado). |
| **Upstream**             | Zona del workflow anterior al commitment-status. Representa actividades de exploración y preparación. |
| **Downstream**           | Zona del workflow a partir del commitment-status. Representa ejecución activa. |
| **Commitment Point**     | Estado en el que el equipo se compromete formalmente a ejecutar un workitem. Separa upstream de downstream. |
| **Delivery Point**       | Estado final del workflow de un workitem. Indica que el trabajo está completamente entregado. |
| **Jerarquía padre-hijo** | Relación entre workitems de distintos niveles: un Release (L2) contiene Feats (L1), que contienen Specs (L0). |
| **Autoplay**             | Modo de simulación continua donde los ticks avanzan automáticamente a intervalos regulares. |
| **Step**                 | Modo de simulación manual donde el usuario avanza la simulación un tick a la vez. |

---

# 🎯 Resultado

Este sistema permite modelar de forma realista:

* Sistemas ágiles complejos
* Dependencias entre niveles
* Flujo de valor que en este ejemplo es desde Spec → Feat → Release

---
