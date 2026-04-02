## Context

El engine ya estampa `enteredAt: currentTick` en cada ítem que avanza de columna. La UI renderiza todos los `Card` en cada re-render de React. La única información faltante en `Card` es el tick actual para poder comparar `item.enteredAt === currentTick`.

El proyecto usa exclusivamente inline styles (sin CSS modules, sin Tailwind). Las animaciones CSS requieren `@keyframes`, que no se puede definir en un inline style. La solución más limpia sin romper esa convención es un único bloque `<style>` estático en `index.html`.

## Goals / Non-Goals

**Goals:**
- Mostrar un flash verde (borde + glow) en cada `Card` cuyo `enteredAt` coincide con el tick actual.
- La animación dura ~0.6s y se desvanece automáticamente (fade-out), independientemente del intervalo del autoplay.
- No modificar el engine, los tipos de dominio ni la configuración.
- Mantener la convención de inline styles para todos los demás estilos.

**Non-Goals:**
- No agregar nueva lógica de estado en React (no `useState` extra, no `useRef` de timers).
- No hacer el flash configurable (color, duración) en esta iteración.
- No animar ítems que solo cambiaron `isReady` sin cambiar `statusId` (esos ya tienen el indicador de ready signal existente).

## Decisions

### Decisión 1: `@keyframes` en `index.html`, no en componentes

**Alternativa descartada A**: Inyectar un `<style>` tag con `document.createElement` desde un componente React. Funcionaría pero introduce un side effect en render que viola la convención.

**Alternativa descartada B**: Usar `animation` inline sin `@keyframes` (solo `transition`). Un `transition` de opacidad en el borde no logra el efecto flash; requiere cambiar el valor después de un frame, lo que necesitaría `useEffect` + `setTimeout` + estado extra.

**Decisión adoptada**: Agregar un bloque `<style>` estático en `index.html` con la definición de `@keyframes tick-flash`. Es el único lugar del proyecto que puede contener CSS global sin violar las convenciones del código TypeScript/React.

### Decisión 2: Pasar `currentTick` como prop (prop drilling), no como contexto React

**Alternativa descartada**: Crear un `SimContext` con `React.createContext`. Sería over-engineering para un dato que ya fluye directamente de `App` a `Board` a `Column` a `Card` — son solo 3 niveles.

**Decisión adoptada**: Prop drilling simple: `App` pasa `simState.tick` como `currentTick` a `Board`, que lo pasa a `Column`, que lo pasa a `Card`. Cambios mínimos y trazables.

### Decisión 3: Condición `item.enteredAt === currentTick`, no comparación de snapshots

**Alternativa descartada**: En `App.tsx`, comparar `prevState.workitems` vs `newState.workitems` para construir un `Set<string>` de IDs que avanzaron, y pasarlo como prop. Más explícito pero requiere estado adicional y lógica en `App`.

**Decisión adoptada**: Aprovechar que `enteredAt` ya es exactamente `currentTick` cuando un ítem avanzó. La condición es O(1) por card, sin estado extra.

**Caso borde**: ítems creados en tick 0 (`buildInitialState`) tienen `enteredAt = 0`. En tick 0 `currentTick` es también 0, así que los ítems iniciales flashearían una vez al inicio — comportamiento aceptable y educativo (muestra cuándo entraron).

## Risks / Trade-offs

- **`@keyframes` fuera del componente**: El nombre `tick-flash` debe ser único y no colisionar con otros estilos futuros. → Usar nombre específico `tick-flash` (ya es bastante único en el contexto de este app).
- **Tick 0 flash**: Los ítems iniciales flashean al cargar. → Comportamiento leve, aceptable; indica el estado inicial.
- **Reset muestra flash**: Al hacer Reset, todos los ítems se recrean con `enteredAt = 0` y `simState.tick = 0`, por lo que flashean. → Coherente con el comportamiento tick-0.
