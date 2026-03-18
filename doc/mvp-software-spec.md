# 🧠 Kanban 3 Niveles Simulator — Especificación de Requerimientos de Software

## Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Objetivos](#2-objetivos)
3. [Modelo de Dominio](#3-modelo-de-dominio)
4. [Workflows](#4-workflows)
5. [Reglas de Negocio](#5-reglas-de-negocio)
6. [Modelo de Simulación](#6-modelo-de-simulación)
7. [Interfaz de Usuario](#7-interfaz-de-usuario)
8. [Requerimientos Funcionales](#8-requerimientos-funcionales)
9. [Requerimientos No Funcionales](#9-requerimientos-no-funcionales)
10. [Posibles Extensiones](#10-posibles-extensiones)
11. [Consideraciones Técnicas](#11-consideraciones-técnicas)
12. [Definición de Done](#12-definición-de-done)
13. [Glosario](#13-glosario)

---

## 📌 1. Descripción General

El **Kanban 3 Niveles Simulator (Kanban3NSim)** es una aplicación frontend que simula visualmente flujos de trabajo jerárquicos en tres niveles:

* **L3: Release** → nivel estratégico superior
* **L2: Feat** → nivel táctico medio
* **L1: Spec** → nivel operativo bajo o inferior

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

Si bien el sistema tiene una configuración inicial por defecto, es altamente configurable: permite definir diferentes workflows, nombres de niveles, reglas de negocio y parámetros de simulación para explorar distintos escenarios.

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

* En una simulación y configuración existe solo tres niveles: nivel 3 (L3), nivel 2 (L2) y nivel 1 (L1).
* Cada nivel tiene un tablero del workflow asociado al nivel, con su respectiva configuración de estados y reglas.
* Cada nivel tiene un tipo de workitem asociado, con su respectiva descripción y nivel de abstracción.

La configuración inicial y por defecto es la siguiente:

| Nivel | Nombre    | Descripción                  | Alcance del Nivel |
| ----- | --------- | ---------------------------- | ----------------- |
| L3    | Release   | Entrega completa del sistema | Estratégico       |
| L2    | Feat      | Funcionalidad del sistema    | Táctico           |
| L1    | Spec      | Unidad implementable         | Operativo         |

---

### 3.2 Workitems

#### 3.2.1 Workitem Type (workitemType)

* Los workitems son de tres tipos: L1, L2, y L3.
* En el caso del ejemplo inicial los Workitems son: L3=Release, L2=Feat y L1=Spec.
* Cada workitemType tiene un color asociado, cada una con su color representativo: L3=azul, L2=naranja y L1=verde respectivamente.

#### 3.2.2 Workitem (workitem)

* Cada workitem tiene su ID. Los IDs de workitems siguen una nomenclatura `[Primeras tres letras del nombre del tipo de workitem]-[ID numérico incremental por tipo]`, por ejemplo:
   * Workitem type=Release → RELE-1, RELE-2, RELE-3, ...
   * Workitem type=Feat → FEAT-1, FEAT-2, FEAT-3, ...
   * Workitem type=Spec → SPEC-1, SPEC-2, SPEC-3, ...
* Cada workitem tiene un estado (status) que representa su posición actual en el workflow.
* Cada workitem tiene una referencia a su padre (parentId) y a sus hijos (children) para modelar la jerarquía. Los workitems del nivel 3 no tienen padre, los del nivel 2 tienen un padre del nivel 3 e hijos del nivel 1, y los del nivel 1 tienen un padre del nivel 2 y no tienen hijos.
* Cada workitem tiene un tipo (workitemType) que indica si es L3, L2 o L1 (en el ejemplo de configuración inicial: Release, Feat o Spec).

---

## 🔄 4. Workflows

### 4.1 Workflow de nivel 3 (Level-3-Workflow) para Releases

Workflow principal para Releases:
```txt
Initial → Defining → Plan → Ready → Develop → To-Integrate → Integration-UAT → Ready-for-Prod → Deploy → Released
```

Consideraciones sobre este workflow:
* Upstream: Initial → Defining → Plan → Ready
* Punto de compromiso (commitment-status): Ready
* Downstream: Develop → To-Integrate → Integration-UAT → Ready-for-Prod → Deploy → Released
* Punto de entrega (delivery-status): Released

---

### 4.2 Workflow de nivel 2 (Level-2-Workflow) para Feats

```txt
Pending → Refining → Ready-for-Develop → Developing → Code-Review → QA-Validation → Acceptance → Ready-to-Integrate → In-Production
```

Consideraciones sobre este workflow:
* Upstream: Pending → Refining → Ready-for-Develop
* Punto de compromiso (commitment-status): Ready-for-Develop
* Downstream: Developing → Code-Review → QA-Validation → Acceptance → Ready-to-Integrate → In-Production
* Punto de entrega (delivery-status): In-Production

---

### 4.3 Workflow de nivel 1 (Level-1-Workflow) para Specs

```txt
Todo → Specifying → Designing → Ready-for-Implement → Implementing → Validation → Completed
```

Consideraciones sobre este workflow:
* Upstream: Todo → Specifying → Designing → Ready-for-Implement
* Punto de compromiso (commitment-status): Ready-for-Implement
* Downstream: Implementing → Validation → Completed
* Punto de entrega (delivery-status): Completed

---

## ⚙️ 5. Reglas de Negocio

### 5.1 Reglas Release

1. Cuando un Release pasa a **Ready**:

   * Se crean todas sus Feats hijas en estado **Pending** (por defecto: 3 Feats)

2. Cuando la PRIMERA Feat pasa a **Developing**:

   * El Release padre pasa a **Develop**

3. Cuando TODAS las Feats están en **Ready-to-Integrate**:

   * El Release pasa a **To-Integrate**

4. Cuando TODAS las Feats están en **In-Production**:

   * El Release pasa a **Released**

---

### 5.2 Reglas Feat

5. Cuando una Feat pasa a **Ready-for-Develop**:

   * Se crean sus Specs hijas en estado **Todo** (por defecto: 3 Specs)

6. Si alguna Spec pasa a **Implementing**:

   * La Feat debe estar o pasar a **Developing**

7. Regla de consistencia estricta:

   * Una Feat NO puede avanzar más allá de **Developing** si alguna Spec NO está en **Completed**

8. Cuando TODAS las Specs están en **Completed**:

   * La Feat avanza a **Code-Review**
   * Luego continúa su flujo normalmente

---

### 5.3 Reglas Spec

9. Las Specs:

   * Avanzan de forma autónoma
   * No dependen de otros workitems

---

### 5.4 Reglas Globales

10. Progresión secuencial:

* Cada workitem inicia su ciclo de vida en el primer estado del workflow (por ejemplo: Initial, Pending o Todo)
* Cada workitem avanza secuencialmente estado por estado (sin saltos)

11. Restricción de avance:

* En cada ciclo de simulación, un workitem puede avanzar **máximo una columna**

12. Dependencias:

* Workitems en estado de commitment-status (por ejemplo **Ready**, **Ready-for-Develop**, **Ready-for-Implement**) gatillan la creación de sus hijos o su avance depende del avance de sus hijos.
* Workitems en estado de delivery-status (por ejemplo **Released**, **In-Production**, **Completed**) son estados finales (done).

13. Autonomía:

* Workitems en estado posterior al commitment-status avanzan por sí mismos si cumplen las reglas jerárquicas (sus hijos ya deben estar done).
* Los workitems del nivel 1 (Specs) son completamente autónomos, no dependen de otros workitems para avanzar.

---

### 5.5 Reglas de Fórmula General para distribución de STATUS-CATEGORY

* Los STATUS-CATEGORY son tres: TODO, IN-PROGRESS, DONE.
* Los colores representativos de STATUS-CATEGORY son: TODO=gris, IN-PROGRESS=azul, DONE=verde.
* Para CADA nivel, la distribución es:
   * TODO = [Estados del Upstream]
   * IN-PROGRESS = [Estados del Downstream excepto el último]
   * DONE = [Estado final del Downstream o delivery-status]

---

### 5.6 Reglas de Punto de Compromiso (commitment-status)

En este modelo y en su configuración por defecto, los puntos de compromiso son:

| Nivel | Nombre  | commitment-status    | Significado                                    |
| ----- | ------- | -------------------- | ---------------------------------------------- |
| L3    | Release | Ready                | "Nos comprometemos a desarrollar este Release" |
| L2    | Feat    | Ready-for-Develop    | "Nos comprometemos a implementar esta Feat"    |
| L1    | Spec    | Ready-for-Implement  | "Nos comprometemos a codificar esta Spec"      |

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

* La simulación inicia con **1 Release** en estado **Initial**.
* No existen Feats ni Specs al inicio.
* Los workitems hijos se crean dinámicamente según las reglas de negocio (§5.1, §5.2).
* La cantidad inicial de Releases y su estado inicial son configurables via JSON.

---

## 🖥 7. Interfaz de Usuario

### 7.1 Layout General

Los tres tableros se presentan **verticalmente apilados** en la pantalla, reflejando la jerarquía del modelo:

```
┌──────────────────────────────────────┐
│  🟦 Level-3 (Release) Board          │
├──────────────────────────────────────┤
│  🟨 Level-2 (Feat) Board             │
├──────────────────────────────────────┤
│  🟩 Level-1 (Spec) Board             │
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

### 7.2 Tarjetas (workitems)

Las tarjetas son la forma en que se renderiza un workitem en la UI. Cada tarjeta muestra:

* El ID del workitem (ej: RELE-1, FEAT-2, SPEC-3)
* El color del tipo de workitem (L3=azul, L2=naranja, L1=verde)

---

### 7.3 Características UI

* Diseño compacto (sin scroll horizontal)
* Columnas responsivas (wrap)
* Alta densidad de información

---

### 7.4 Botones de Acción

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

El sistema debe respetar las reglas jerárquicas definidas entre niveles.

**Criterios de aceptación:**
- Cuando una Feat está en Developing y alguna de sus Specs no está en Completed, la Feat no puede avanzar más allá de Developing.
- Cuando la primera Feat de un Release pasa a Developing, el Release pasa automáticamente a Develop.
- Cuando todas las Feats de un Release están en In-Production, el Release pasa automáticamente a Released.

---

### RF-04 — Creación automática de workitems hijos

El sistema debe crear automáticamente workitems hijos según las reglas de negocio.

**Criterios de aceptación:**
- Cuando un Release pasa a Ready, se crean exactamente 3 Feats en estado Pending.
- Cuando una Feat pasa a Ready-for-Develop, se crean exactamente 3 Specs en estado Todo.
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

* El sistema debe ser configurable.
* La configuración se define mediante un objeto en formato JSON.
* En esta primera versión MVP, la configuración puede estar definida directamente en el código (hardcoded) o en un archivo; no se requiere UI para editar la configuración.

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

### 11.2 Estructura de Módulos Sugerida

```
src/
├── config/
│   └── defaultConfig.ts        # Configuración inicial (workflows, niveles, parámetros)
├── domain/
│   ├── types.ts                # Tipos: Workitem, Workflow, Status, Level, etc.
│   └── rules.ts                # Reglas de negocio (evaluación de transiciones)
├── simulation/
│   └── engine.ts               # Motor de simulación: función pura tick()
├── components/
│   ├── Board.tsx               # Tablero de un nivel
│   ├── Column.tsx              # Columna (estado del workflow)
│   └── Card.tsx                # Tarjeta (workitem)
└── App.tsx                     # Composición principal y estado global
```

### 11.3 Decisiones de Diseño

* **Función pura para el tick:** El motor de simulación (`engine.ts`) es una función pura que recibe el estado actual y devuelve el nuevo estado. Esto facilita el testing y la reproducibilidad.
* **Separación dominio / UI:** Las reglas de negocio viven en `domain/rules.ts`, independientemente de los componentes React.
* **Configuración centralizada:** Todos los parámetros variables (workflows, probabilidades, cantidad de hijos, estado inicial) se definen en `config/defaultConfig.ts`.

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
| **Workitem**             | Unidad de trabajo dentro de la simulación. Puede ser un Release (L3), Feat (L2) o Spec (L1). |
| **Workflow**             | Secuencia ordenada de estados por la que pasan los workitems de un nivel. |
| **Status**               | Estado individual dentro de un workflow (ej: Developing, Completed). |
| **statusCategory**       | Categoría de un estado: TODO (pendiente), IN-PROGRESS (en curso) o DONE (terminado). |
| **Upstream**             | Zona del workflow anterior al commitment-status. Representa actividades de exploración y preparación. |
| **Downstream**           | Zona del workflow a partir del commitment-status. Representa ejecución activa. |
| **Commitment Point**     | Estado en el que el equipo se compromete formalmente a ejecutar un workitem. Separa upstream de downstream. |
| **Delivery Point**       | Estado final del workflow de un workitem. Indica que el trabajo está completamente entregado. |
| **Jerarquía padre-hijo** | Relación entre workitems de distintos niveles: un Release (L3) contiene Feats (L2), que contienen Specs (L1). |
| **Autoplay**             | Modo de simulación continua donde los ticks avanzan automáticamente a intervalos regulares. |
| **Step**                 | Modo de simulación manual donde el usuario avanza la simulación un tick a la vez. |

---

# 🎯 Resultado

Este sistema permite modelar de forma realista:

* Sistemas ágiles complejos
* Dependencias entre niveles
* Flujo de valor que en este ejemplo es desde Spec → Feat → Release

---
