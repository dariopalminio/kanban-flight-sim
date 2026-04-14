## Context

El cambio es puramente de datos: un nuevo archivo JSON bajo `src/config/models/`. El loader ya usa `import.meta.glob("./models/*.json", { eager: true })` desde el cambio `split-config-models`, por lo que el archivo se incorpora automáticamente en el siguiente build sin tocar TypeScript.

## Goals / Non-Goals

**Goals:**
- Definir la estructura completa de los cuatro workflows del modelo "XP-FL Workflows".
- Respetar las restricciones del motor: exactamente un `isBeforeCommitmentPoint`, un `isPosDeliveryPoint`, y al menos dos statuses DOWNSTREAM por workflow.

**Non-Goals:**
- Cambios en el motor, el loader, la UI o los tipos de dominio.
- Agregar WIP limits iniciales (el usuario puede editarlos en runtime con el control existente).

## Decisions

### D1 — Estructura de workflows

| Nivel | Nombre workflow | Upstream | Downstream |
|---|---|---|---|
| L3 | Initiative | Options | Exploration · Active · Steering · Measuring · Sustained/Stopped |
| L2 | Release-Epic | Release-Plan | Selected · In-Progress · Validating&Acceptance · Released |
| L1 | User-Story | Options · Iteration-Plan | Committed · Iteration-In-Progress · Acceptance · Done |
| L0 | Task _(placeholder)_ | Backlog | Ready · In-Progress · Done |

Reglas de mapeo al motor:
- **`isBeforeCommitmentPoint: true`** — último status UPSTREAM de cada nivel: `Options` (L3), `Release-Plan` (L2), `Iteration-Plan` (L1), `Backlog` (L0).
- **`isPosDeliveryPoint: true`** — último status de cada nivel: `Sustained/Stopped` (L3), `Released` (L2), `Done` (L1), `Done` (L0).
- **`isBuffer: true`** — primer status DOWNSTREAM en L3 (`Exploration`), L2 (`Selected`) y L1 (`Committed`): actúan como buffers de entrada listos para ser jalados.
- **`hasReadySignal: true`** — status upstream finales con señal de "listo" antes del commitment: `Options` (L3), `Release-Plan` (L2), `Iteration-Plan` (L1).

### D2 — L0 como placeholder

El motor requiere cuatro niveles. El modelo XP-FL no tiene un nivel operacional explícito, por lo que se incluye un workflow `Task` mínimo (4 statuses). Los usuarios pueden activar el toggle "Sin L0" en la UI para ocultarlo.

### D3 — Parámetros de simulación

| Parámetro | Valor | Razón |
|---|---|---|
| `initialReleaseCount` | 3 | Tres iniciativas activas al inicio, típico en XP |
| `advanceProbability` | 0.5 | Default estándar del simulador |
| `childrenPerParent` | 3 | Default estándar del simulador |
| `demandInterval` | 0 | Sin demanda continua; las iniciativas se cargan al inicio |

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| El nombre `Sustained/Stopped` contiene `/`, que es válido en JSON pero podría causar problemas en IDs. | El `id` del status usará kebab-case sin `/`: `initiative-sustained-stopped`. |
| L0 es un placeholder sin semántica XP real. | Documentado como tal; el toggle "Sin L0" permite ignorarlo. |

## Migration Plan

No aplica — es un archivo nuevo, no modifica nada existente.

## Open Questions

Ninguna pendiente.
