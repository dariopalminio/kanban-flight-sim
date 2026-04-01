## 1. Keyframe CSS en index.html

- [x] 1.1 Agregar un bloque `<style>` en el `<head>` de `index.html` con la definición de `@keyframes tick-flash`: de `outline: 2px solid #22c55e; box-shadow: 0 0 8px #22c55e` en `0%` a `outline: 2px solid transparent; box-shadow: none` en `100%`

## 2. Prop threading: currentTick

- [x] 2.1 En `Board.tsx`: agregar `currentTick: number` a `Props` y pasarlo a cada `<Column currentTick={currentTick} ...>`
- [x] 2.2 En `Column.tsx`: agregar `currentTick: number` a `Props` y pasarlo a cada `<Card currentTick={currentTick} ...>`
- [x] 2.3 En `Card.tsx`: agregar `currentTick: number` a `Props`
- [x] 2.4 En `App.tsx`: pasar `currentTick={simState.tick}` a cada `<Board>`

## 3. Flash en Card

- [x] 3.1 En `Card.tsx`: calcular `const justMoved = item.enteredAt === currentTick`
- [x] 3.2 Aplicar `animation: justMoved ? "tick-flash 0.6s ease-out" : "none"` en el `style` del div principal del Card

## 4. Verificación

- [x] 4.1 Confirmar que `tsc --noEmit` no reporta errores
- [x] 4.2 Verificar en browser que al presionar Step, los cards que avanzaron muestran el flash verde y los que no avanzaron no lo muestran
- [x] 4.3 Verificar que el flash coexiste correctamente con el ready-signal indicator (borde izquierdo verde + badge ✓) sin sobreescribirse
