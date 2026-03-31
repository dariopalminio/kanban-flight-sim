# Reglas de simulación de Flight-Levels workflows

## Conceptos Clave

| Término | Definición |
|---------|------------|
| **Work-item Padre** | Work-item de nivel superior (L3 Initiative, L2 Release) que contiene o se desglosa en work-items hijos |
| **Work-item Hijo** | Work-item de nivel inferior (L2 Release, L1 Feat) que pertenece a un work-item padre |
| **Primer estado de Downstream** | El primer estado después de la zona de definición. Representa el "compromiso" o "lista para ejecutar". En nuestro diseño: L3 = "Seleccionada", L2 = "Listo", L1 = "Listo-para-Desarrollo" |
| **Primer estado de in-progress** | El segundo estado de Downstream. Representa el inicio de trabajo activo. En nuestro diseño: L3 = "En-Desarrollo", L2 = "Desarrollando-Release", L1 = "Desarrollo" |
| **statusCategory Done** | Estados terminales que indican que el work-item ha completado su ciclo. En nuestro diseño: L3 = "Finalizada", L2 = "Liberado", L1 = "Entregado" |


## Reglas particulares del flujo SDDF workflows:

### Flujos de simulación SDDF workflows:

L3, Initiative: Embudo → Definir&Descubrir → [commitment-point] → Seleccionada → En-Desarrollo → Midiendo-Valor → Finalizada
L3, Upstream: Embudo → Definir&Descubrir
L3, Downstream: Seleccionada → En-Desarrollo → Midiendo-Valor → Finalizada
L2. Release: Definición → [commitment-point] → Listo → Desarrollando-Release → En-Integración → En-Aceptación → Liberado
L2, Upstream: Definición
L2, Downstream: Listo → Desarrollando-Release → En-Integración → En-Aceptación → Liberado
L1, Feat: Refinamiento → [commitment-point] → Listo-para-Desarrollo → Desarrollo → Pruebas-QA → Aceptación → Entregado
L1, Upstream: Refinamiento 
L1, Downstream: Listo-para-Desarrollo → Desarrollo → Pruebas-QA → Aceptación → Entregado

### Reglas de creación automática (Trigger-Down):

1. Regla (trigger-down): Si en L3 la Initiative entra a "Seleccionada" (Primer estado de Downstream), entonces se crean los Releases de esa Initiative en el primer estado del workflow L2 (primer estado de Upstream del L2).
2. Regla (trigger-down): Si en L2 el Release entra a "Listo" (Primer estado de Downstream), entonces se crean los Feat de ese Release en el primer estado del workflow L1 (primer estado de Upstream del L1).

### Reglas de progresión automática:
3. Regla (trigger-up):Si la primera Release hijo (en L2) de una Iniciativa padre (L3) pasa a Desarrollando-Release (primer estado de in-progress de L2, segundo estado del Downstream de L2), El estado de su padre en L3 pasa a En-Desarrollo (primer estado in-progress de L3, segundo estado Downstream de L3).
4. Regla (trigger-up): Si la primera Feat hija (en L1) de una Release padre (L2) pasa a Desarrollo (primer estado de in-progress de L1, segundo estado del Downstream de L1), entonces el estado de su padre en L2 pasa a Desarrollando-Release (primer estado in-progress de L2, segundo estado Downstream de L2).

### Reglas de ready automático:
5. Regla (trigger-up): Si todos los Releases de la Iniciativa están en Liberado (pasaron el delivery-point), entonces se marca el estado En-Desarrollando de la iniciativa (el primer estado in-progress, segundo estado del Downstream) como "ready" (estado interno de listo). 
6. Regla (trigger-up): Si todas las Feats del Release están en Entregado (pasaron el delivery-point), entonces se marca Desarrollando-Release (el primer estado in-progress) como "ready" (estado interno de listo). 

## Reglas generales:

### Flujos de simulación general:

En general los flujos son semejantes al siguiente patrón, aunque con nombres de estados y cantidad de estados variables según la simulación:

L3: First-Upstream-state → [commitment-point] →First-Downstream-state →Second-Downstream-state → Done(first-delivery-point)
L3, Upstream: First-Upstream-state
L3, Downstream: First-Downstream-state →Second-Downstream-state → Done(first-delivery-point)
L2: First-Upstream-state → [commitment-point] →First-Downstream-state →Second-Downstream-state → Done(first-delivery-point)
L2, Upstream: First-Upstream-state
L2, Downstream: First-Downstream-state →Second-Downstream-state → Done(first-delivery-point)
L1: First-Upstream-state → [commitment-point] →First-Downstream-state →Second-Downstream-state → Done(first-delivery-point)
L1, Upstream: First-Upstream-state
L1, Downstream: First-Downstream-state →Second-Downstream-state → Done(first-delivery-point)


### Reglas de creación automática (Trigger-Down):
Estas reglas se disparan cuando un work-item padre entra a su primer estado de Downstream, lo que indica que está listo para ser desglosado en work-items hijos que serán ejecutados.

1. Regla (trigger-down): Si en L3 el work-item entra a el primer estado de Downstream, entonces se crean los work-items hijos de esa work-item padre en el primer estado del workflow L2 (Primer estado de Upstream del L2).
2. Regla (trigger-down): Si en L2 el work-item entra al primer estado de Downstream, entonces se crean los work-item hijos de ese work-item padre en el primer estado del workflow L1 (primer estado de Upstream del L1).

### Reglas de progresión automática:
Estas reglas se disparan cuando el primer work-item hijo de un padre entra a su primer estado de in-progress, lo que indica que el trabajo real ha comenzado y el padre debe avanzar a su estado activo.

3. Regla (trigger-up): Si el primera work-item hijo en L2 de un work-item padre de L3 pasa al primer estado de in-progress de L2 (segundo estado del Downstream de L2), El estado de su padre en L3 pasa a primer estado in-progress de L3 (segundo estado Downstream de L3).
4. Regla (trigger-up): Si el primer work-item hijo en L1 de un work-item padre de L2 pasa a primer estado de in-progress de L1 (segundo estado del Downstream de L1), entonces el estado de su padre en L2 pasa a primer estado in-progress de L2 (segundo estado Downstream de L2).

### Reglas de ready automático:
Estas reglas se disparan cuando todos los work-items hijos han completado su ciclo (statusCategory Done), lo que indica que el padre está listo para avanzar a su siguiente fase.

5. Regla (trigger-up): Si todos los work-items hijos de L2 del work-item padre L3 están en statusCategory Done (pasaron el delivery-point), entonces se marca el estado en-progreso del padre en L3 (el primer estado in-progress, segundo estado del Downstream L3) como "ready" (estado interno de listo). 
6. Regla (trigger-up): Si todos los work-items en nivel L1 del padre de L2 están en statusCategory Done (pasaron el delivery-point), entonces se marca el primer estado de in-progress del padre (el primer estado in-progress, segundo estado del Downstream de L2) como "ready" (estado interno de listo). 

7. Para L0 se repite el patron anterior pero sin la creación automática hacia abajo de hijos, dado que L0 es el nivel más bajo.
8. El nivel mas bajo no genera hijos por ser el último nivel.
9. El nivel más alto no tiene padres ni gatilla progresión automática hacia arriba ni redy automático hacia arriba porque es el primer nivel.

