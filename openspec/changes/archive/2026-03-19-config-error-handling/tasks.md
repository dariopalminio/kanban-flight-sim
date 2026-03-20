## 1. Fallback en defaultConfig.ts

- [x] 1.1 Reemplazar la exportación `export const defaultConfig: Config = loadSimulation(raw.defaultSimulation)` por una IIFE que busque la simulación por defecto y caiga al primer elemento si no la encuentra, exponiendo `configLoadResult: { config: Config; error?: string }`
- [x] 1.2 Mantener `export const defaultConfig: Config = configLoadResult.config` para no romper los consumidores existentes
- [x] 1.3 Agregar guard para lista de simulaciones vacía: si `raw.simulations` está vacío, lanzar un `Error` descriptivo (será capturado por el ErrorBoundary)

## 2. ErrorBoundary en main.tsx / App.tsx

- [x] 2.1 Crear componente `ErrorBoundary` (class component React) con método `componentDidCatch` que renderiza un mensaje de error legible en lugar de la UI normal
- [x] 2.2 Envolver el árbol raíz de la app (en `main.tsx` o en `App.tsx`) con el `ErrorBoundary`

## 3. Banner de advertencia en App.tsx

- [x] 3.1 Importar `configLoadResult` en `App.tsx`
- [x] 3.2 Renderizar un banner de advertencia con estilo inline (fondo amarillo/ámbar) cuando `configLoadResult.error` sea un string no vacío, posicionado encima de los tableros
