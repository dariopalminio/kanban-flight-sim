## Context

Actualmente, el campo `category` de cada `Status` se deriva en `defaultConfig.ts` mediante la función `assignCategory()` usando estas reglas:
- `streamType === "UPSTREAM"` → `"TODO"`
- Último status del array → `"DONE"`
- Resto → `"IN_PROGRESS"`

Esta derivación automática es conveniente pero rígida: no permite asignar `"DONE"` a un status intermedio ni `"IN_PROGRESS"` al último. Además, la intención del configurador no queda explícita en el JSON.

El campo `category` ya existe en el tipo `Status` de `types.ts` y es usado por `Column.tsx` en el highlight mode `"category"` para pintar las columnas. No hay cambios en el motor de simulación.

## Goals / Non-Goals

**Goals:**
- Añadir `statusCategory` como campo explícito y requerido en cada objeto de estado del JSON de configuración.
- Usar ese valor directamente como `category` en el tipo `Status`, eliminando la derivación automática.
- Mantener la misma experiencia visual del highlight mode `"category"`.

**Non-Goals:**
- No se añade validación de `statusCategory` en runtime (la app ya es un SPA educativo sin backend).
- No se cambia la lógica del motor de simulación (`engine.ts`).
- No se modifican los colores del highlight mode ni la UI de `Column.tsx`.
- No se añade retrocompatibilidad: el JSON debe ser migrado completamente.

## Decisions

### 1. Nombre del campo: `statusCategory` (no `category`)

El tipo `Status` ya tiene un campo llamado `category`. Usar un nombre diferente en el JSON (`statusCategory`) hace explícita la distinción entre el valor de configuración (fuente) y el campo del dominio (destino). La función de carga simplemente mapea `statusCategory → category`.

**Alternativa descartada:** Usar `category` directamente en el JSON. Aunque más simple, causaría ambigüedad con el campo derivado actual y dificultaría una eventual migración futura.

### 2. Campo requerido (no opcional con fallback)

`statusCategory` será requerido en `RawStatus`. No se mantendrá la derivación automática como fallback. Esto fuerza al configurador a ser explícito y evita comportamientos silenciosamente incorrectos.

**Alternativa descartada:** Campo opcional con fallback a `assignCategory()`. Añade complejidad y oscurece el origen del valor.

### 3. Eliminar `assignCategory()`

Con `statusCategory` requerido en el JSON, `assignCategory()` en `defaultConfig.ts` queda obsoleta y se elimina. El mapeo se reduce a un spread directo: `{ ...rawStatus, category: rawStatus.statusCategory }`.

## Risks / Trade-offs

- **[Riesgo] Datos inválidos en JSON** → Mitigación: TypeScript en el loader detectará el campo faltante en tiempo de compilación si `RawStatus` se tipifica correctamente.
- **[Riesgo] Inconsistencia semántica** → Mitigación: La documentación de cada valor (`"TODO"`, `"IN_PROGRESS"`, `"DONE"`) es autoexplicativa; se añade un comentario en el JSON si es necesario.
- **[Trade-off] Más verbosidad en el JSON** → Cada status requiere un campo adicional. Aceptable dado que el JSON es la fuente de verdad explícita del proyecto.
