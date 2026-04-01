## Context

Actualmente `Card.tsx` usa un mapa estático `LEVEL_COLORS` (L3=`#7c3aed`, L2=`#1d4ed8`, L1=`#1f6e79`, L0=`#ea580c`) para el fondo de cada tarjeta. El color no porta información sobre el linaje del ítem.

El motor ya registra `parentId` en cada ítem hijo, lo que permite derivar el linaje. Los ítems L3 son la raíz de cada árbol familiar.

## Goals / Non-Goals

**Goals:**
- Cada árbol familiar (L3 + todos sus descendientes) comparte un mismo color.
- Los ítems L3 reciben colores de una paleta predefinida de forma cíclica.
- El color se persiste en `Workitem.color` para que el render sea stateless.

**Non-Goals:**
- No se cambia la lógica de simulación ni de WIP.
- No se añade selector de color ni configuración JSON.
- No se modifica el color del header de tablero ni de columnas.

## Decisions

### 1. Paleta de colores fija y cíclica

Se define una paleta de N colores en el motor (o en un módulo de utilidad). Los ítems L3 reciben `PALETTE[index % PALETTE.length]` donde `index` es el contador L3 en el momento de creación (0-based). Esto garantiza que el primer proyecto siempre tenga el mismo color, el segundo también, etc.

**Alternativa descartada:** color aleatorio puro (`Math.random()`). No sería reproducible entre resets y podría generar colores muy similares consecutivos.

### 2. `color: string` en `Workitem`

El color se almacena directamente en el ítem. Al crear hijos, se copia `parent.color`. La función `Card` solo lee `item.color` — sin lógica de derivación en el componente.

**Alternativa descartada:** derivar el color en `Card` buscando al ancestro L3. Requiere pasar el array completo de ítems a cada `Card`, complica el render y viola la separación de responsabilidades.

### 3. Paleta propuesta (10 colores distinguibles sobre fondo oscuro)

```
#e74c3c  rojo
#e67e22  naranja
#f1c40f  amarillo
#2ecc71  verde
#1abc9c  teal
#3498db  azul
#9b59b6  violeta
#e91e63  rosa
#00bcd4  cyan
#ff9800  ámbar
```

### 4. Asignación del índice

`buildInitialState` crea `initialReleaseCount` ítems L3. El ítem con índice `i` (0-based) recibe `PALETTE[i % PALETTE.length]`.

En `tick()` Paso 8 (inyección de demanda), el nuevo ítem L3 recibe el color según el contador L3 actualizado: `PALETTE[(counters.L3 - 1) % PALETTE.length]` (después de incrementar el contador con `nextId`).

En los pasos de creación de hijos (Pasos 3, 5, 7), cada hijo hereda `color` del ítem padre que lo genera.

## Risks / Trade-offs

- **[Trade-off] Paleta finita** → Con más de 10 proyectos activos simultáneamente, los colores se repiten. Mitigación: la paleta es suficiente para simulaciones educativas típicas; se puede ampliar fácilmente.
- **[Riesgo] Color `#f1c40f` (amarillo) poco legible** → El texto blanco sobre amarillo tiene bajo contraste. Mitigación: aceptable dado el tamaño pequeño de la tarjeta y la naturaleza educativa de la herramienta. Se puede ajustar la paleta si es necesario.
