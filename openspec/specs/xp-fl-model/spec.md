## ADDED Requirements

### Requirement: Modelo "XP-FL Workflows" disponible en el simulador
El simulador SHALL incluir un modelo de simulación llamado `"XP-FL Workflows"` definido en `src/config/models/xp-fl-workflows.json`. El modelo SHALL aparecer en el selector de simulaciones sin requerir cambios en código TypeScript.

#### Scenario: Modelo aparece en el selector
- **WHEN** la aplicación inicia
- **THEN** `simulationNames` SHALL contener `"XP-FL Workflows"`

#### Scenario: Modelo carga sin errores
- **WHEN** el usuario selecciona "XP-FL Workflows"
- **THEN** la simulación inicia y los cuatro tableros (L3, L2, L1, L0) se renderizan sin errores en consola

---

### Requirement: Workflow L3 — Initiative
El nivel L3 SHALL implementar el workflow de Initiative con los siguientes estados en orden:

| Order | ID | Name | Stream | Rol |
|---|---|---|---|---|
| 1 | `initiative-options` | Options | UPSTREAM | commitment point, hasReadySignal |
| 2 | `initiative-exploration` | Exploration | DOWNSTREAM | first downstream, isBuffer |
| 3 | `initiative-active` | Active | DOWNSTREAM | second downstream |
| 4 | `initiative-steering` | Steering | DOWNSTREAM | — |
| 5 | `initiative-measuring` | Measuring | DOWNSTREAM | — |
| 6 | `initiative-sustained-stopped` | Sustained/Stopped | DOWNSTREAM | delivery point |

#### Scenario: L3 tiene exactamente 6 estados
- **WHEN** el modelo "XP-FL Workflows" es cargado
- **THEN** el workflow L3 SHALL tener exactamente 6 estados con los IDs y nombres definidos en la tabla

#### Scenario: Commitment point en Options
- **WHEN** el workflow L3 es cargado
- **THEN** exactamente el status `initiative-options` SHALL tener `isBeforeCommitmentPoint: true`

#### Scenario: Delivery point en Sustained/Stopped
- **WHEN** el workflow L3 es cargado
- **THEN** exactamente el status `initiative-sustained-stopped` SHALL tener `isPosDeliveryPoint: true`

---

### Requirement: Workflow L2 — Release-Epic
El nivel L2 SHALL implementar el workflow de Release/Epic con los siguientes estados en orden:

| Order | ID | Name | Stream | Rol |
|---|---|---|---|---|
| 1 | `release-plan` | Release-Plan | UPSTREAM | commitment point, hasReadySignal |
| 2 | `release-selected` | Selected | DOWNSTREAM | first downstream, isBuffer |
| 3 | `release-in-progress` | In-Progress | DOWNSTREAM | second downstream |
| 4 | `release-validating` | Validating&Acceptance | DOWNSTREAM | — |
| 5 | `release-released` | Released | DOWNSTREAM | delivery point |

#### Scenario: L2 tiene exactamente 5 estados
- **WHEN** el modelo "XP-FL Workflows" es cargado
- **THEN** el workflow L2 SHALL tener exactamente 5 estados

#### Scenario: Commitment point en Release-Plan
- **WHEN** el workflow L2 es cargado
- **THEN** exactamente el status `release-plan` SHALL tener `isBeforeCommitmentPoint: true`

#### Scenario: Delivery point en Released
- **WHEN** el workflow L2 es cargado
- **THEN** exactamente el status `release-released` SHALL tener `isPosDeliveryPoint: true`

---

### Requirement: Workflow L1 — User-Story
El nivel L1 SHALL implementar el workflow de User Story con los siguientes estados en orden:

| Order | ID | Name | Stream | Rol |
|---|---|---|---|---|
| 1 | `story-options` | Options | UPSTREAM | — |
| 2 | `story-iteration-plan` | Iteration-Plan | UPSTREAM | commitment point, hasReadySignal |
| 3 | `story-committed` | Committed | DOWNSTREAM | first downstream, isBuffer |
| 4 | `story-iteration-in-progress` | Iteration-In-Progress | DOWNSTREAM | second downstream |
| 5 | `story-acceptance` | Acceptance | DOWNSTREAM | — |
| 6 | `story-done` | Done | DOWNSTREAM | delivery point |

#### Scenario: L1 tiene exactamente 6 estados
- **WHEN** el modelo "XP-FL Workflows" es cargado
- **THEN** el workflow L1 SHALL tener exactamente 6 estados

#### Scenario: Commitment point en Iteration-Plan
- **WHEN** el workflow L1 es cargado
- **THEN** exactamente el status `story-iteration-plan` SHALL tener `isBeforeCommitmentPoint: true`

#### Scenario: Dos estados UPSTREAM en L1
- **WHEN** el workflow L1 es cargado
- **THEN** exactamente 2 estados (`story-options` e `story-iteration-plan`) SHALL tener `streamType: "UPSTREAM"`

#### Scenario: Delivery point en Done
- **WHEN** el workflow L1 es cargado
- **THEN** exactamente el status `story-done` SHALL tener `isPosDeliveryPoint: true`

---

### Requirement: Workflow L0 — Task (placeholder)
El nivel L0 SHALL incluir un workflow mínimo de Task para satisfacer el motor de simulación. Este nivel puede ocultarse con el toggle "Sin L0" existente en la UI.

| Order | ID | Name | Stream | Rol |
|---|---|---|---|---|
| 1 | `task-backlog` | Backlog | UPSTREAM | commitment point |
| 2 | `task-ready` | Ready | DOWNSTREAM | first downstream, isBuffer |
| 3 | `task-in-progress` | In-Progress | DOWNSTREAM | second downstream |
| 4 | `task-done` | Done | DOWNSTREAM | delivery point |

#### Scenario: L0 tiene exactamente 4 estados
- **WHEN** el modelo "XP-FL Workflows" es cargado
- **THEN** el workflow L0 SHALL tener exactamente 4 estados

---

### Requirement: Parámetros del modelo
El modelo SHALL declarar los parámetros de simulación con los siguientes valores por defecto:

| Campo | Valor |
|---|---|
| `initialReleaseCount` | 3 |
| `advanceProbability` | 0.5 |
| `childrenPerParent` | 3 |
| `demandInterval` | 0 |

#### Scenario: Parámetros correctos al cargar
- **WHEN** el modelo "XP-FL Workflows" es cargado
- **THEN** `config.initialReleaseCount` SHALL ser `3`, `config.advanceProbability` SHALL ser `0.5`, y `config.demandInterval` SHALL ser `0`
