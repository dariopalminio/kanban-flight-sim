## Context

`Column.tsx` actualmente renderiza todos sus `Card`s dentro de un `<div>` sin restricción de altura. En simulaciones largas las columnas Done (statusCategory === "DONE") acumulan muchas tarjetas, empujando el layout hacia abajo y haciendo difícil leer los demás tableros. El cambio es puntual en un único componente.

## Goals / Non-Goals

**Goals:**
- Fijar una altura máxima en las columnas Done cuando superan el umbral y activar scroll vertical interno.
- Exponer el umbral como una constante con nombre para facilitar ajustes futuros.

**Non-Goals:**
- No aplica a columnas TODO ni IN_PROGRESS.
- No hay cambios en engine, configuración, dominio ni otros componentes.
- No se introduce ninguna nueva dependencia externa.

## Decisions

**Decisión: constante `DONE_COLUMN_SCROLL_THRESHOLD` en `Column.tsx`**  
La constante vive en el mismo archivo que la aplica. Alternativa descartada: moverla a un archivo de constantes global (innecesario para una sola constante de UI local).

**Decisión: `maxHeight` basada en un múltiplo de la altura estimada de tarjeta**  
Se calcula `maxHeight = DONE_COLUMN_SCROLL_THRESHOLD * CARD_HEIGHT_PX` donde `CARD_HEIGHT_PX` es la altura estimada de una tarjeta (aprox. 16–20 px). Esto da una altura que corresponde exactamente a N tarjetas visibles antes del scroll. Alternativa descartada: `maxHeight` fija en px duros (menos semántica, no evoluciona si cambia CARD_HEIGHT_PX).

**Decisión: `overflowY: "auto"` en el contenedor de tarjetas, no en el `<div>` raíz de la columna**  
El header de la columna (nombre, WIP) debe permanecer siempre visible. Solo el área de tarjetas hace scroll. Se envuelven los `Card`s en un `<div>` interno con el overflow.

## Risks / Trade-offs

- [Riesgo: altura de tarjeta no exacta] → El valor de `CARD_HEIGHT_PX` es una estimación; si en el futuro el estilo de `Card` cambia, habrá que actualizar también esa constante. Mitigación: documentar la relación en el mismo archivo.
- [Riesgo: scrollbar visible en temas no previstos] → Usar `overflowY: "auto"` (scroll solo si es necesario) en lugar de `"scroll"` (siempre visible).
