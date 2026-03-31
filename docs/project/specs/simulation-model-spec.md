# Modelo de simulación de Flujo de Valor por Niveles

## Conceptos Clave

| Término | Definición |
|---------|------------|
| **Work-item Padre** | Work-item de nivel superior (L3 Initiative, L2 Release) que contiene o se desglosa en work-items hijos |
| **Work-item Hijo** | Work-item de nivel inferior (L2 Release, L1 Feat) que pertenece a un work-item padre |
| **Primer estado de Downstream** | El primer estado después de la zona de definición. Representa el "compromiso" o "lista para ejecutar". En nuestro diseño: L3 = "Seleccionada", L2 = "Listo", L1 = "Listo-para-Desarrollo" |
| **Primer estado de in-progress** | El segundo estado de Downstream. Representa el inicio de trabajo activo. En nuestro diseño: L3 = "En-Desarrollo", L2 = "Desarrollando-Release", L1 = "Desarrollo" |
| **statusCategory Done** | Estados terminales que indican que el work-item ha completado su ciclo. En nuestro diseño: L3 = "Finalizada", L2 = "Liberado", L1 = "Entregado" |


## Modelo Kanban Esencial (Essential Kanban FL)

El modelo Flight Level Esencial captura la esencia de Essential Kanban y Flight Levels de tres niveles de tableros kanban anidados. Captura la lógica fundamental de Flight Levels sin complejidad innecesaria. Este es el núcleo sobre el que luego puedes añadir capas de especialización (estados intermedios, clases de servicio, WIP limits) según las necesidades de tu organización.
Flujos esenciales:

### Niveles

* Nivel L3:   Nivel superior (estratégico)
* Nivel L2:   Nivel intermedio (coordinación)
* Nivel L1:  Nivel inferior (táctico)

### Workitems

Cada nivel tiene un work-item principal asignado al flujo. Por ejemplo:
* Nivel L3:  Initiativa
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

Este modelo de simulación captura la esencia de cómo los work-items se relacionan y progresan a través de los niveles, y cómo las reglas de trigger-up y trigger-down mantienen la coherencia del flujo. Es un punto de partida para entender y luego expandir el modelo con más detalles según las necesidades específicas de tu organización.





