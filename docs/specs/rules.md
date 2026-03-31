# Reglas de simulación

## Reglas particulares del flujo SDF workflows:

### Reglas de creación automática:

1. Regla (trigger-down): Si en L3 la Initiative entra a "Seleccionada" (Primer estado de Downstream), entonces se crean los Releases de esa Initiative en el primer estado del workflow L2 (primer estado de Upstream del L2).
2. Regla (trigger-down): Si en L2 el Release entra a "Listo" (Primer estado de Downstream), entonces se crean los Feat de ese Release en el primer estado del workflow L1 (primer estado de Upstream del L1).

### Reglas de progresión automática:
3. Si la primera Release hijo (en L2) de una Iniciativa padre (L3) pasa a Desarrollando-Release (primer estado de in-progress de L2, segundo estado del Downstream de L2), El estado de su padre en L3 pasa a En-Desarrollo (primer estado in-progress de L3, segundo estado Downstream de L3).
4. Si la primera Feat hija (en L1) de una Release padre (L2) pasa a Desarrollo (primer estado de in-progress de L1, segundo estado del Downstream de L1), entonces el estado de su padre en L2 pasa a Desarrollando-Release (primer estado in-progress de L2, segundo estado Downstream de L2).

### Reglas de ready automático:
5. Si todos los Releases de la Iniciativa están en Liberado (pasaron el delivery-point), entonces se marca el estado En-Desarrollando de la iniciativa (el primer estado in-progress, segundo estado del Downstream) como "ready" (estado interno de listo). 
6. Si todas las Feats del Release están en Entregado (pasaron el delivery-point), entonces se marca Desarrollando-Release (el primer estado in-progress) como "ready" (estado interno de listo). 

## Reglas generales:

### Reglas de creación automática:
1. Regla (trigger-down): Si en L3 el work-item entra a el primer estado de Downstream, entonces se crean los work-items hijos de esa work-item padre en el primer estado del workflow L2 (Primer estado de Upstream del L2).
2. Regla (trigger-down): Si en L2 el work-item entra al primer estado de Downstream, entonces se crean los work-item hijos de ese work-item padre en el primer estado del workflow L1 (primer estado de Upstream del L1).

### Reglas de progresión automática:
3. Si el primera work-item hijo en L2 de un work-item padre de L3 pasa al primer estado de in-progress de L2 (segundo estado del Downstream de L2), El estado de su padre en L3 pasa a primer estado in-progress de L3 (segundo estado Downstream de L3).
4. Si el primer work-item hijo en L1 de un work-item padre de L2 pasa a primer estado de in-progress de L1 (segundo estado del Downstream de L1), entonces el estado de su padre en L2 pasa a primer estado in-progress de L2 (segundo estado Downstream de L2).

### Reglas de ready automático:
5. Si todos los work-items hijos de L2 del work-item padre L3 están en statusCategory Done (pasaron el delivery-point), entonces se marca el estado en-progreso del padre en L3 (el primer estado in-progress, segundo estado del Downstream L3) como "ready" (estado interno de listo). 
6. Si todos los work-items en nivel L1 del padre de L2 están en statusCategory Done (pasaron el delivery-point), entonces se marca el primer estado de in-progress del padre (el primer estado in-progress, segundo estado del Downstream de L2) como "ready" (estado interno de listo). 

7. Para L0 se repite el patron anterior pero sin la creación automática hacia abajo de hijos, dado que L0 es el nivel más bajo.
8. El nivel mas bajo no genera hijos por ser el último nivel.
9. El nivel más alto no tiene padres ni gatilla progresión automática hacia arriba ni redy automático hacia arriba porque es el primer nivel.

