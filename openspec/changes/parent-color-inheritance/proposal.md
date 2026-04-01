## Why

Actualmente todas las tarjetas de un nivel se pintan con el mismo color fijo según el nivel (L3=violeta, L2=azul, L1=naranja, L0=verde), lo que hace imposible distinguir visualmente a qué "familia" pertenece un workitem. Implementar colores por linaje permite al usuario seguir de un vistazo el flujo de un proyecto y sus descendientes a través de todos los niveles.

## What Changes

- Añadir el campo `color: string` al tipo `Workitem` para almacenar el color CSS asignado a cada ítem.
- Al crear ítems L3 (en `buildInitialState` y en la inyección de demanda del Paso 8), asignar un color de una paleta predefinida de forma cíclica según el índice del ítem L3.
- Al crear ítems hijos (L2, L1, L0) en el motor, heredar el `color` del padre.
- El componente `Card` usa `item.color` como fondo en lugar del color fijo por nivel.

## Capabilities

### New Capabilities

- `workitem-color`: Asignación y herencia de color por linaje — los ítems L3 reciben un color de una paleta al crearse; todos sus descendientes heredan ese color.

### Modified Capabilities

- `kanban-board-ui`: Las tarjetas ya no usan color fijo por nivel; usan `item.color`.

## Impact

- `src/domain/types.ts`: `Workitem` añade `color: string`.
- `src/simulation/engine.ts`: `buildInitialState` asigna color a ítems L3. `tick()` hereda `color` del padre al crear hijos y al inyectar demanda (Paso 8).
- `src/components/Card.tsx`: usa `item.color` en lugar del mapa de colores por nivel.
- Sin cambios en la configuración JSON ni en `Status`/`Workflow`.
