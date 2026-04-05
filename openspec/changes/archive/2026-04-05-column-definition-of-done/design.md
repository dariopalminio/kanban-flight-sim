## Context

El campo `definitionOfDone` ya existe en `defaultConfig.json` (p. ej. en `initiative-funnel`), pero el tipo `Status` en `domain/types.ts` no lo declara, así que TypeScript lo descarta en el spread `{ ...s }` de `buildWorkflow`. Actualmente la única información contextual visible en el header de una columna es el `description` (como tooltip hover), insuficiente para textos pedagógicos largos como una DoD.

## Goals / Non-Goals

**Goals:**
- Agregar `definitionOfDone?: string` al tipo `Status` para que el campo fluya correctamente desde JSON → `buildWorkflow` → `Column`.
- Mostrar un botón "DoD" en el header de la columna cuando `status.definitionOfDone` esté definido y no sea vacío.
- Al hacer click en el botón, mostrar/ocultar un panel con el texto completo de la DoD, usando estado local de React (`useState`).

**Non-Goals:**
- No se modifica el engine ni ninguna función pura.
- No se introducen librerías externas ni portals del DOM; el panel es inline dentro del componente Column.
- No se cambia la lógica de `defaultConfig.ts` — el spread `{ ...s }` ya propaga el campo automáticamente una vez que el tipo lo declare.

## Decisions

**Decisión: `useState` local en `Column` para visibilidad del panel DoD**  
El panel es puramente presentacional y no necesita ser compartido con ningún padre. Estado local en Column es la opción más simple. Alternativa descartada: levantar estado a `Board` o `App` (innecesario).

**Decisión: botón "DoD" con texto fijo, inline en el header existente**  
Se inserta después del indicador `✓` de buffer. Alternativa descartada: ícono SVG (requeriría asset adicional); alternativa descartada: tooltip nativo `title` (no permite texto largo con formato).

**Decisión: panel renderizado como `<div>` absoluto/relativo dentro del `<div>` raíz de la columna, con `position: "absolute"` y `zIndex` alto**  
Garantiza que el panel se superponga sobre tarjetas adyacentes sin cambiar el layout del tablero. El contenedor raíz de la columna necesita `position: "relative"` para anclar el panel.

**Decisión: el campo migra sin cambios en `defaultConfig.ts`**  
`buildWorkflow` usa `{ ...s }` para copiar todos los campos del status. Al agregar `definitionOfDone` al tipo `Status`, TypeScript incluirá el campo automáticamente. No se necesita migración de datos en el JSON existente — los statuses sin el campo simplemente tendrán el campo `undefined`.

## Risks / Trade-offs

- [Riesgo: panel se recorta por overflow del tablero] → Usar `zIndex` elevado y verificar que el contenedor ancestro no tenga `overflow: hidden` que recorte el panel. Si ocurre, alternativa es renderizar el panel abajo del header con `position: static` y empujar las tarjetas hacia abajo.
- [Riesgo: botón DoD ocupa espacio valioso en headers pequeños] → El label "DoD" es corto (3 caracteres); el botón usa `fontSize: 8` y padding mínimo para ser no invasivo.
