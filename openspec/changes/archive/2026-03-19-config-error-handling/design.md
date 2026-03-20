## Context

`defaultConfig.ts` importa el JSON con `import raw from "./defaultConfig.json"` y ejecuta `loadSimulation(raw.defaultSimulation)` directamente al nivel del módulo (línea 59). Si `defaultSimulation` no corresponde a ninguna simulación de la lista, la función lanza un `Error` no capturado que provoca una página en blanco. Adicionalmente, si el JSON está corrupto o mal formado, Vite/TypeScript fallará en tiempo de parse y la app tampoco cargará.

El proyecto es un SPA puro sin backend, sin framework de testing, con estilos inline y React 18.

## Goals / Non-Goals

**Goals:**
- La app nunca debe quedar en blanco por errores de configuración.
- Si `defaultSimulation` no coincide con ninguna simulación de la lista, usar la primera simulación disponible como fallback.
- Si el JSON está completamente inválido (no parseable), mostrar un mensaje de error claro y estático en el DOM, no una pantalla en blanco.
- El usuario debe ver feedback visual cuando se usó un fallback (ej. banner de advertencia).

**Non-Goals:**
- Validación exhaustiva del schema JSON (campos faltantes, tipos incorrectos dentro de una simulación).
- Recarga dinámica del archivo de configuración en runtime.
- Mecanismo de recuperación automática de JSON corrupto.

## Decisions

### Decisión 1: Manejo de error de `defaultSimulation` no encontrado en `defaultConfig.ts`

**Elegido:** Modificar `defaultConfig.ts` para que, en lugar de lanzar una excepción, exporte un objeto con la configuración cargada y un flag de error opcional.

```ts
// En lugar de:
export const defaultConfig: Config = loadSimulation(raw.defaultSimulation);

// Usar:
export const configLoadResult: { config: Config; error?: string } = (() => {
  const first = raw.simulations[0];
  const target = raw.simulations.find(s => s.name === raw.defaultSimulation) ?? first;
  const error = target === first && raw.defaultSimulation !== first.name
    ? `Simulation "${raw.defaultSimulation}" not found; using "${first.name}" as fallback.`
    : undefined;
  return { config: buildConfig(target), error };
})();
export const defaultConfig: Config = configLoadResult.config;
```

**Alternativa descartada:** Usar un `try/catch` en `App.tsx`. Esto requeriría convertir la importación del módulo a dinámica o envolver el import, lo cual es más invasivo y no captura el error en su origen.

**Rationale:** El error ocurre en `defaultConfig.ts`; es más limpio manejarlo ahí y exponer el resultado al consumidor (`App.tsx`) como estado, no como excepción.

### Decisión 2: JSON corrupto o no parseable

**Elegido:** Este caso es un error de build/bundling (Vite falla al procesar el import estático). No se puede capturar en runtime de la misma forma. La mitigación es un `ErrorBoundary` en React envolviendo toda la app.

**Alternativa descartada:** Cargar el JSON vía `fetch` en runtime para poder capturar el error de parse. Esto añade complejidad asíncrona y cambia la arquitectura del módulo innecesariamente.

**Rationale:** Un `ErrorBoundary` en `main.tsx` o `App.tsx` es la forma estándar de React para evitar pantallas en blanco por errores no capturados en render. Muestra un mensaje de error legible en lugar del blanco.

### Decisión 3: Feedback visual al usuario

**Elegido:** En `App.tsx`, si `configLoadResult.error` existe, mostrar un banner de advertencia inline (estilo inline, sin librerías) sobre los tableros, indicando el problema y la simulación usada como fallback.

## Risks / Trade-offs

- [Riesgo] Si `raw.simulations` está vacío, el fallback a `first` lanzará un error al llamar `buildConfig(undefined)`. → Mitigación: Agregar un guard explícito: si la lista de simulaciones está vacía, lanzar un error descriptivo capturado por el `ErrorBoundary`.
- [Trade-off] El `ErrorBoundary` cubre errores de render pero no errores de módulo ocurridos antes de que React monte. Si Vite falla en el import del JSON, el `ErrorBoundary` de React no aplica. → Esto queda fuera de alcance; se documenta en Non-Goals.
- [Trade-off] Mantener `export const defaultConfig` como antes preserva compatibilidad con todos los consumidores actuales; solo `App.tsx` necesita acceder a `configLoadResult.error`.
