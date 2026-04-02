## Why

Al simular el "caminar el tablero" (avance derecha-a-izquierda), el usuario no puede distinguir visualmente qué ítems se movieron durante el tick actual. Un flash momentáneo de borde verde permite observar el flujo en tiempo real y entender el comportamiento pull del engine.

## What Changes

- El componente `Card` recibirá el tick actual (`currentTick`) y mostrará un borde verde brillante + glow cuando `item.enteredAt === currentTick`, indicando que el ítem avanzó en ese tick.
- La animación de fade-out se implementa con un `@keyframes` inyectado una sola vez en `index.html`, referenciado desde el estilo inline de `Card`.
- `currentTick` se pasa como prop por el árbol: `App → Board → Column → Card`.
- No se modifica el engine ni el estado de simulación.

## Capabilities

### New Capabilities

- `tick-flash-highlight`: Indicador visual momentáneo (borde verde + animación fade-out) en los work items que avanzaron de columna en el tick más reciente.

### Modified Capabilities

- `kanban-board-ui`: El componente `Card` recibe un prop adicional `currentTick` y aplica un estilo condicional. `Board` y `Column` agregan `currentTick` a sus Props para forwarding.

## Impact

- `index.html`: Agregar bloque `<style>` con `@keyframes tick-flash` para la animación.
- `src/App.tsx`: Pasar `simState.tick` como prop `currentTick` a `<Board>`.
- `src/components/Board.tsx`: Recibir y pasar `currentTick` a `<Column>`.
- `src/components/Column.tsx`: Recibir y pasar `currentTick` a `<Card>`.
- `src/components/Card.tsx`: Recibir `currentTick`, aplicar `animation: "tick-flash 0.6s ease-out"` cuando `item.enteredAt === currentTick`.
- Sin cambios en engine, tipos, configuración ni otros componentes.
