# 🧠 Kanban 3 Niveles Simulator — Especificación de Requerimientos de Software

## 📌 1. Descripción General

El **Kanban 3 Niveles Simulator (Kanban3NSim)** es una aplicación frontend que permite simular visualmente flujos de trabajo jerárquicos en tres niveles:

* **L3: Release** → nivel estratégico superior
* **L2: Feat** → nivel táctico medio
* **L1: Spec** → nivel operativo bajo o inferior

El sistema modela los flujos de trabajo (workflows) compuestos por estados (status) de los tres niveles (levels) y sus dependencias (dependencias entre workflows). Modela jerarquías padre-hijo entre estos niveles y permite observar cómo evolucionan los elementos de trabajo (workitems) por los estados (status) de diferentes flujos de trabajo (workflows) a lo largo del tiempo mediante una simulación discreta (por pasos). Toda la simulación se visualiza en una vista de tres tableros Kanban paralelos, uno por cada nivel, con sus respectivas columnas de estados (status) y tarjetas que representan elementos de trabajo (workitems). La simulación se ejecuta paso a paso (manual por un botón) o de forma continua (botón de autoplay), mostrando cómo los workitems avanzan por los estados de cada workflow (avanzando por columna), respetando las reglas jerárquicas y de consistencia definidas. El sistema es una herramienta educativa para entender la dinámica de sistemas ágiles complejos con múltiples niveles de trabajo y dependencias.

La interface de simulación permite visualizar conceptos kanban como upstream vs downstream, puntos de compromiso (commitment points) y puntos de entrega (delivery points) en un contexto multi-nivel, mostrando cómo las decisiones y progresos en niveles inferiores afectan a los niveles superiores y viceversa. Si bien el modelo tendrà una configuración inicial por defecto, es altamente configurable, permitiendo definir diferentes workflows, nombres de cada nivel, reglas de negocio y parámetros de simulación para explorar distintos escenarios y dinámicas de trabajo.

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

Por ejemplo en configuración inicial y por defecto es la siguiente:

| Nivel | Nombre    | Descripción                  | Alcance del Nivel |
| ------| --------- | ---------------------------- | ----------------- |
| L3    | Release   | Entrega completa del sistema | Estratégico       |
| L2    | Feat      | Funcionalidad del sistema    | Táctico           |
| L1    | Spec      | Unidad implementable         | Operativo         |

---

### 3.2 Workitems

#### 3.2.1 Workitem Type  (workitemType)

* Los workitems son de tres tipos: L1, L2, y L3.
* En el caso del ejemplo inicial los Workitems son: L3=Release, L2=Feat y L1=Spec.
* Cada workitemType tiene un color asociado, cada una con su color representativo: L3=azul, L2=naranja y L1=verde respectivamente.

#### 3.2.2 Workitem  (workitem)

* Cada workitem tiene su ID. Los IDs de workitems siguen una nomenclatura [Primeras tres letras del nombre del tipo de workitem]-[ID numérico incremental por tipo], por ejemplo:
   * Workitem type=Release → RELE-1, RELE-2, RELE-3, ...
   * Workitem type=Feat → FEAT-1, FEAT-2, FEAT-3, ...
   * Workitem type=Spec → SPEC-1, SPEC-2, SPEC-3, ...
* Cada workitem tiene un estado (status) que representa su posición actual en el workflow.
* Cada workitem tiene una referencia a su padre (parentId) y a sus hijos (childrens) para modelar la jerarquía. Los workitems del nivel 3 no tienen padre, los del nivel 2 tienen un padre del nivel 3 e hijos del nivel 1, y los del nivel 1 tienen un padre del nivel 2 y no tienen hijos.
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
* Upstream: Todo → Specifying → Ready-for-Implement
* Punto de compromiso (commitment-status): Ready-for-Implement
* Downstream: Implementing → Validation → Completed
* Punto de entrega (delivery-status): Completed

---

## ⚙️ 5. Reglas de Negocio

### 5.1 Reglas Release

1. Cuando un Release pasa a **Ready**:

   * Se crean todas sus Feats hijas en estado **Pending**

2. Cuando la PRIMERA Feat pasa a **Developing**:

   * El Release padre pasa a **Develop**

3. Cuando TODAS las Feats están en **Ready-to-Integrate**:

   * El Release pasa a **To-Integrate**

4. Cuando TODAS las Feats están en **In-Production**:

   * El Release pasa a **Released**

---

### 5.2 Reglas Feat

5. Cuando una Feat pasa a **Ready-for-Develop**:

   * Se crean sus Specs hijas en estado **Todo**

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

* Workitems en estado de commitment-status como por ejemplo **Ready / Ready-for-Develop** dependen de sus hijos (gatillan creación de hijos o su avance depende del avance de sus hijos)
* Workitems en estado de delivery-status como por ejemplo **Released / In-Production / Completed   son estados finales de done.

13. Autonomía:

* Workitems en estado posterior a desarrollo avanzan por sí mismos (si cumplen reglas) sin depender del avance de sus hijos porque sus hijos ya deben estar done para que ellos puedan avanzar.

* Los workitems del nivel 1 (Specs) son completamente autónomos, no dependen de otros workitems para avanzar, y avanzan por sí mismos siguiendo su workflow y el paso del tiempo de la simulación.

---

### 5.5 Reglas de Fórmula General para distribución de estados STATUS-CATEGORY

* Los STATUS-CATEGORY son tres: TODO, IN-PROGRESS, DONE.
* Los colores representativos de STATUS-CATEGORY son tres: TODO como gris, IN-PROGRESS como azul, DONE como verde.
* Para CADA nivel, la distribución es:
   * TODO = [Estados de exploración o Downstream] 
   * IN PROGRESS = [Estados de ejecución activa del Downstream] (todo downstream excepto el último)
   * DONE = [Estado final del downstream o delivery-status]

### 5.5 Reglas de Punto de compromiso (commitment-status)

En este modelo y en su configuración por defecto, los puntos de compromiso (commitment-status) son:
* En L3 y nombre RELEASE: Ready	"Nos comprometemos a desarrollar este Release"
* En L2 y nombre FEAT: Ready-for-Develop	"Nos comprometemos a implementar esta Feat"
* En L1 y nombre SPEC: Ready-for-Implement	"Nos comprometemos a codificar esta Spec"

## ⏱ 6. Modelo de Simulación

* Simulación basada en pasos discretos (ticks)
* Cada tick representa una unidad de tiempo
* En la simulación automática (autoplay), los ticks avanzan automáticamente cada cierto intervalo configurado (por ejemplo, cada 1 segundo)
* En cada tick:

  * Los workitems pueden o no avanzar (probabilístico)
  * Se evalúan reglas jerárquicas
  * Se aplican restricciones de consistencia

---

## 🖥 7. Interfaz de Usuario

### 7.1 Tableros

La UI presenta tres tableros independientes:

* 🟦 Level-3 (Release) Board
* 🟨 Level-2 (Feat) Board
* 🟩 Level-1 (Spec) Board

Cada tablero:

* Contiene columnas por estado
* Muestra tarjetas (workitems)
* Se actualiza en cada tick

* Cada estado (status) tiene los siguientes atributos:
   * statusCategory: TODO, IN-PROGRESS o DONE.
   * streamType: UPSTREAM o DOWNSTREAM.
   * isCommitmentStatus: booleano que indica si es un punto de compromiso.
   * isDeliveryStatus: booleano que indica si es un punto de entrega.

### 7.2 Tarjetas  (workitems)

Las tarjetas es la forma en que se muestra o renderiza un workitem en la UI.
De principio la tarjeta muestra el ID del workitem y se pinta del color del tipo de workitem.

---

### 7.3 Características UI

* Diseño compacto (sin scroll horizontal)
* Columnas responsivas (wrap)
* Alta densidad de información
* Actualización manual (botón “Step”)

### 7.4 Botones de acción

* Debe haber un botón de "Step" para avanzar la simulación un tick. 
* Debe haber un botón de "Autoplay" para ejecutar la simulación de forma continua.
* Debe haber un botón para resetear  "Reset" la simulación al inicio.
* Un botón "Upstream vs Downstream view" para pintar las columnas que representan el upstream de un color y las que representan downstrem de otro color.
* Un botón "Status Category view" para pintar las columnas que representan el statusCategory Todo, In-Progress y Done con colores específicos.
* Un botón "Commitment status View" para resaltar los puntos de estado de compromiso (columna del commitment-status).
* Un botón "Delivery status View" para resaltar los puntos de estado de entrega (columna delivery-status) con un borde o fondo especial.

---

## ⚡ 8. Requerimientos Funcionales

### RF-01

El sistema debe permitir simular la evolución de workflows por pasos.

### RF-02

El sistema debe mostrar tres tableros independientes (Release, Feat, Spec).

### RF-03

El sistema debe respetar las reglas jerárquicas entre workitems.

### RF-04

El sistema debe crear automáticamente workitems hijos según reglas.

### RF-05

El sistema debe impedir estados inválidos (consistencia).

### RF-06

El sistema debe limitar el avance a una sola transición por tick.

### RF-07

El sistema debe reflejar visualmente el estado actual de cada workitem.

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
* La configuración debe hacerse mediante un objeto formato JSON.
* En esta primera versión MVP, la configuración se puede definir directamente en el código (hardcoded) o en archivo y no es necesario una UI para editar la configuración.

---

## 📊 10. Posibles Extensiones

* Métricas (lead time, cycle time)
* WIP limits
* Animaciones entre columnas
* Autoplay (simulación continua)
* Highlight de dependencias
* Exportación de datos

---

## 🧠 11. Consideraciones Técnicas

* Framework: React + Vite
* Lenguaje: TypeScript
* Estado: local (useState)
* Simulación: función pura determinística con componente probabilístico

---

## ✅ 12. Definición de Done

* Todos los workflows implementados correctamente
* Reglas respetadas sin inconsistencias
* UI funcional sin scroll horizontal
* Simulación estable (sin loops inválidos)
* Código tipado y mantenible

---

# 🎯 Resultado

Este sistema permite modelar de forma realista:

* Sistemas ágiles complejos
* Dependencias entre niveles
* Flujo de valor desde Spec → Release

---

