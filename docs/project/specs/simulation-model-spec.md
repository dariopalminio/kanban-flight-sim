# Modelo de simulación de Flujo de Valor por Niveles

## Conceptos Clave

* **Work-item**: Una unidad de trabajo (elemento de trabajo) que representa una tarea, historia, épica o iniciativa. Cada work-item tiene su ciclo de vida en un nivel (L1, L2, L3) y tiene un estado dentro de su workflow.
* **Initiative**: Work-item de nivel L3, representa una iniciativa estratégica o un proyecto o un programa alineada a un objetivo estratégico (de OKR, LVT, KPI o Balanced Scorecard).
* **Epic**: Work-item de nivel L2, representa un gran bloque de trabajo que forma parte de una iniciativa (por ejemplo, una release, entregable, módulo o una big-feature).
* **Story**: Work-item de nivel L1, representa una unidad de trabajo más pequeña que forma parte de un Epic (por ejemplo, una historia de usuario o una small-feature).
* **Work-item Padre**: Work-item de nivel superior (L3 Initiative, L2 Release) que contiene o se desglosa en work-items hijos.
* **Work-item Hijo**: Work-item de nivel inferior (L2 Release, L1 Feat) que pertenece a un work-item padre.
* **Workflow**: La secuencia de estados (en un flujo) o columnas (en un tablero) por las que un work-item progresa desde su creación hasta su finalización. En nuestro diseño simple: Backlog → Selected → In-Progress → Done.
* **Upstream**: La parte del flujo que representa el trabajo no comprometido, ideas o solicitudes en espera de ser seleccionadas para ejecución (todos los estados antes de punto de compromiso). En nuestro diseño simple: Backlog.
* **Downstream**: La parte del flujo que representa el trabajo comprometido, seleccionado para ejecución, en progreso o completado (todos los estados después del punto de compromiso). En nuestro diseño simple: Selected → In-Progress → Done.
* **Punto de compromiso (Commitment Point)**: El estado o columna que marca la transición entre el trabajo no comprometido (Upstream) y el trabajo comprometido (Downstream). En nuestro diseño simple: el punto de compromiso es la transición de Backlog a Selected.
* **Primer estado de Downstream**: El primer estado después de la zona de definición. Representa el "compromiso" o "lista para ejecutar". En nuestro diseño: L3 = "Seleccionada", L2 = "Listo", L1 = "Listo-para-Desarrollo".
* **Primer estado de in-progress**: El segundo estado de Downstream (cuando el primer estado es un buffer). Representa el inicio de trabajo activo. En nuestro diseño: L3 = "En-Desarrollo", L2 = "Desarrollando-Release", L1 = "Desarrollo".
* **Tablero (Board)**: Una representación visual (UI) del flujo de trabajo, donde los estados se representan como columnas y los work-items como tarjetas que se mueven a través de las columnas a medida que progresan.
* **Columna (Column)**: Una sección vertical en un tablero que representa un estado específico en el workflow. Los work-items se mueven de columna a columna a medida que avanzan en su ciclo de vida.
* **Tarjeta (Card)**: La representación visual de un work-item en un tablero. Cada tarjeta tiene información relevante del work-item, como su identificador, título, descripción, estado actual, etc.
* **Status Category**: Categoría de estado ('statusCategory') que agrupa estados según su función en el flujo. Las categorías comunes son: 'Todo', 'In-Progress', 'Done'.
* **Status Category 'ToDo'**: Estados que representan trabajo pendiente o no iniciado. En nuestro diseño simple: 'Backlog' y 'Selected'.
* **Status Category 'In-Progress'**: Estados que representan trabajo activo en proceso. En nuestro diseño simple: 'In-Progress'. En otro diseño puede ser: L3 = "En-Desarrollo", L2 = "Desarrollando-Release", L1 = "Desarrollo".
* **Status Category 'Done'**: Estados terminales que indican que el work-item ha completado su ciclo. En nuestro diseño simple es el mismo 'Done'. En otro diseño: L3 = "Finalizada", L2 = "Liberado", L1 = "Entregado". Pueden existir estados de finalización fallida o con expección, como "Rechazada", "Cancelada", etc.
* **WIP (Work In Progress)**: El número de work-items que están en estados de trabajo activo (In-Progress) en un momento dado en una columna o estado de un flujo que no es un buffer. El WIP es una medida clave para entender la cantidad de trabajo que está siendo procesada simultáneamente. Otra forma de verlo es como la cantidad de elementos que hay en una columna.
* **WIP Limit**: Límite de trabajo en progreso que restringe la cantidad de work-items que pueden estar en un estado específico de un flujo (o columna de un tablero) al mismo tiempo. Si un estado tiene un WIP Limit, no se pueden mover más work-items a ese estado (o a esa columna) hasta que haya espacio disponible (es decir, hasta que algunos work-items salgan de ese estado).
* **Ready**: Un sub-estado o marca (en un estado o tarjeta) que indica que un work-item ha completado su procesamiento (y ha cumplido su Definition of Done) en un estado y está listo para avanzar al siguiente estado (por sistema pull). Esto asegura que solo los work-items que han cumplido con la definición de "hecho" (Definition of Done) para ese estado puedan avanzar, manteniendo la calidad y consistencia del flujo.
* **Buffer**: Un tipo de estado en un flujo o columna en un tablero que actúa como un área de espera o almacenamiento temporal entre dos estados de trabajo activo (In-Progress). Un buffer es un estado 'Ready' que no representa trabajo activo, sino que es un área donde los work-items pueden estar "ready" para avanzar al siguiente estado (una cola de espera). Esto ayuda a desacoplar los procesos y permite que el trabajo fluya de manera más suave, evitando bloqueos y sobrecargas en los estados de trabajo activo. Un Buffer al igual que el sub-estado "Ready" son señales de 'pull' que informan que son candidatos para avanzar al siguiente estado, pero el avance solo ocurre cuando hay capacidad disponible en el estado de destino (siguiendo la lógica del sistema pull). En nuestro diseño simple: L3 = "Selected" es un buffer entre "Backlog" e "In-Progress".
* **Sistema Pull**: Un sistema de gestión de flujo donde el trabajo se mueve a través del proceso basado en la demanda y la capacidad, en lugar de ser empujado por un plan predefinido. En un sistema pull, los work-items avanzan al siguiente estado solo cuando hay capacidad disponible y el work-item está listo para avanzar (por ejemplo, marcado como "ready"). Esto ayuda a evitar sobrecargar el sistema y asegura que el trabajo fluya de manera eficiente.
* **Trigger**: Una regla o mecanismo que se activa automáticamente cuando ocurre un evento específico (como un cambio de estado en un work-item) y que puede causar cambios en otros work-items relacionados (por ejemplo, actualizar el estado de un padre cuando un hijo cambia de estado). Los triggers pueden ser "trigger-up" (afectan a work-items padres) o "trigger-down" (afectan a work-items hijos).
* **Trigger-Up**: Un trigger que se activa cuando un work-item hijo cambia de estado y afecta al estado de su work-item padre. Por ejemplo, si el primer hijo de un padre pasa a In-Progress, el padre también debe pasar a In-Progress.
* **Trigger-Down**: Un trigger que se activa cuando un work-item padre cambia de estado y afecta al estado de sus work-items hijos. Por ejemplo, si un padre pasa a Selected (pasa el punto de compromiso), se pueden crear sus elementos hijos en el Backlog del nivel inferior.  
* **Caminar el tablero**: El proceso de revisar los work-items en un tablero o flujo para evaluar si están listos para avanzar al siguiente estado. Esto se hace de derecha a izquierda (de estados más avanzados a estados anteriores) para asegurar que el trabajo fluya de manera ordenada y siguiendo la lógica del sistema pull.


## Modelo Kanban Esencial (Essential Kanban FL)

El modelo Flight Level Esencial captura la esencia de Essential Kanban y Flight Levels de tres niveles de tableros kanban anidados. Captura la lógica fundamental de Flight Levels sin complejidad innecesaria. Este es el núcleo sobre el que luego puedes añadir capas de especialización (estados intermedios, clases de servicio, WIP limits) según las necesidades de tu organización.
Flujos esenciales:

### Niveles

* Nivel L3: Nivel superior (estratégico)
* Nivel L2: Nivel intermedio (coordinación)
* Nivel L1: Nivel inferior (táctico)

### Workitems

Cada nivel tiene un work-item principal asignado al flujo. Por ejemplo:
* Nivel L3:  Initiative
* Nivel L2:  Epic
* Nivel L1:  Story

La regla de jerarquía son:
* Un work-item de nivel superior puede tener muchos hijos de nivel inferior. Por ejemplo: Una iniciativa Initiative puede tener muchas épicas Epic hijas. O por ejemplo: Una épica Epic puede tener muchas historias Story hijas.
Work-items L3 → * Work-items L2 → * Work-items L1

### Workflows por nivel

* Nivel L3:   Backlog → [commitment-point] → Selected → In-Progress → Done
* Nivel L2:   Backlog → [commitment-point] → Selected → In-Progress → Done
* Nivel L1:   Backlog → [commitment-point] → Selected → In-Progress → Done

### Corrientes (Streams)

El Upstream es la parte inicial del workflow, antes del commitment-point, dedicado a ideas en espera de ser comprometidas. No hay trabajo activo real. 
El Downstream es el flujo de la derecha, después del commitment-point, y representa el flujo de trabajo comprometido: seleccionado, en ejecución, completado.

* Upstream: Backlog
* Downstream: Selected → In-Progress → Done

## Reglas

### Reglas de Triggers

Las siguientes son reglas que se gatillan cuando existen cambios de estado en los work-items, y que afectan a otros work-items relacionados (padres o hijos):

1. **Regla de Creación (Trigger-Down)**: Cuando un padre pasa a Selected (pasa el punto de compromiso) y tiene nivel inferior, se pueden crear sus elementos hijos en el Backlog del nivel inferior (desglose de elementos).
* Propósito: Iniciar la descomposición detallada y formal en el momento adecuado. El padre está comprometido, por lo que es momento de planificar los detalles del trabajo.
* Ejemplo: Una Initiative de nivel L3 pasa a Selected → se crean sus Epics en el Backlog de L2.

2. **Regla de Progresión (Trigger-Up)**: Cuando el primer hijo de un padre pasa a In-Progress, el padre debe pasar a In-Progress.
* Propósito: Reflejar que el trabajo real ha comenzado en el nivel inferior, por lo que el nivel superior debe avanzar a su estado activo.
* Ejemplo: La primera Epic (en nivel L2) de una Initiative (de nivel L3) pasa a In-Progress → la Initiative pasa a In-Progress.

3. **Regla de Ready (Trigger-Up)**: Cuando todos los hijos de un padre están terminados Done, el estado In-Progress del padre se marca como "ready" (listo para avanzar al siguiente estado).
* Propósito: Indicar que el padre ha completado todo su trabajo desglosado y está listo para avanzar a su siguiente estado. El avance debe ser un pull (decisión humana o automatizada según contexto).
* Ejemplo: Todas las Epics de una Initiative están Done → la Initiative en In-Progress se marca "ready" para que pueda moverse al siguiente estado (por ejemplo a Done).

4. **Consideraciones de Bordes**
4.1. El primer nivel superior (por ejemplo L3) no tiene padre, por lo que no recibe triggers-down desde niveles superiores.
4.2. El primer nivel superior (por ejemplo L3) no tiene padre, por lo que no dispara triggers-up.
4.3. El último nivel inferior (por ejemplo L1) no tiene hijos, por lo que no dispara triggers-down. Su avance depende solo de su propio flujo.

### Reglas de Pull y WIP Limits

1. **Movimiento hacia la derecha**: Los movimientos de tarjetas work-itemsentre estados en el flujo deben ser pull de izquierda a derecha.

2. **Caminar el tablero (de derecha a izquierda)**: En un determinado nivel, siempre que el movimiento no surga de un trigger, la búsqueda de un work-item para evaluar si avanza al siguiente estado debe debe hacerse de derecha a izquierda, buscando el primer work-item que esté listo para avanzar. Esto asegura que el trabajo fluya de manera ordenada (siguiendo el sistema pull).

3. **Caminar el tablero de abajo a arriba**: El recorrido de elementos de tablero se comienza en el nivel inferior y una vez recorrido todo el tablero se avanza hacia los niveles superiores (siempre de derecha a izquierda).

4. **Pull bloqueado si columna destino llena**: Ningún work-item puede moverse a un estado que tiene "WIP Limit" y cuyo "WIP Limit" ya fue alcanzado (o superado). Si la columna de destino está llena, el pull no puede realizarse hasta que haya espacio disponible.

5. **Pull bloqueado si work-item no está ready**: Ningún work-item puede moverse a un estado si no está marcado como "ready" o están en una columna tipo buffer (columna ready sin procesamiento). Esto asegura que solo los work-items que han completado su procesamiento (actividad de proceso y cumple Definition of Done del estado) puedan avanzar.

### Reglas de Demanda

1. **Demanda a primer columna**: La inyección de nuevos work-items por demanda es siempre a la primera columna.

2. **Demanda nueva respeta WIP**: La inyección de nuevos work-items por demanda NO ocurre si el primer estado del workflow tiene WIP Limit y ya fue alcanzado.

## Ejemplo de Simulación

Supongamos, en el modelo esencial, una Initiative con dos Epics, cada Epic con dos Stories.

1. Paso 1 –> Acción: Se crea una nueva iniciativa –> Estado resultante: Iniciativa en Backlog de L3
2. Paso 2 –> Acción: Initiative pasa a Selected  –> Estado resultante: Se crean Epics en Backlog de L2 (Regla de Creación).
3. Paso 3 –> Acción: Epic 1 pasa a Selected –> Estado resultante: Se crean sus Stories en Backlog de L1 (Regla de Creación).
4. Paso 4 –> Acción: Story 1.1 pasa a In-Progress –> Estado resultante: Epic 1 pasa a In-Progress (Regla de Progresión).
5. Paso 5 –> Acción: Story 1.2 pasa a In-Progress –> Estado resultante: (Epic 1 ya está en In-Progress, no cambia)
6. Paso 6 –> Acción: Story 1.1 y 1.2 pasan a Done  –> Estado resultante: Epic 1 queda con todos sus hijos Done → se marca "ready". (Regla de Ready)
7. Paso 7 –> Acción: Epic 1 pasa a Done (pull manual o automático) –> Estado resultante: Epic 1 completada.
8. Paso 8 –> Acción: Epic 2 pasa por proceso similar –> Estado resultante: Cuando Epic 2 también esté Done, Initiative tendrá todos sus hijos Done → se marca "ready" (Regla de Ready).
9. Paso 9 –> Acción: Initiative pasa a Done (pull manual o automático) –> Estado resultante: Cierre de la iniciativa.

Este modelo de simulación captura la esencia de cómo los work-items se relacionan y progresan a través de los niveles, y cómo las reglas de trigger-up, trigger-down y sistema pull mantienen la coherencia del flujo. Es un punto de partida para entender y luego expandir el modelo con más detalles según las necesidades específicas de tu organización.





