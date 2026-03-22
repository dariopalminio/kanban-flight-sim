# Simulation Model v1

## 1. Objetivo de este documento

Este documento describe **como funciona realmente** el modelo de simulacion implementado en el proyecto Kanban Flight Sim, tomando como fuente el codigo y contrastandolo con la especificacion MVP.

Se cubre:
- Arquitectura tecnica y flujo de datos
- Paradigma de programacion usado
- Modelo de dominio
- Mecanica del motor de simulacion (tick)
- Reglas de jerarquia, WIP, senales de ready y demanda continua
- Integracion con UI y configuracion

## 2. Resumen ejecutivo del modelo

El sistema implementa una simulacion discreta basada en ticks para 4 niveles jerarquicos (L3, L2, L1, L0). En cada tick, los workitems pueden:
- Avanzar probabilisticamente
- Activar al padre cuando un hijo entra en downstream
- Crear hijos en el punto de compromiso
- Bloquearse/desbloquearse por regla de completitud de hijos
- Ser restringidos por limites WIP

Adicionalmente, el modelo actual incorpora:
- **Senal de ready en dos fases** por estado (`hasReadySignal` + `isReady`)
- **Inyeccion de nueva demanda L3** cada N ticks (`demandInterval`)

## 3. Paradigma de programacion

El proyecto es mayoritariamente:
- **Funcional e inmutable** en el dominio de simulacion
- **Declarativo** en la capa de interfaz (React)
- **Tipado estatico** con TypeScript

### 3.1 Funcional

El nucleo del modelo esta en una funcion pura:
- `tick(state, config) => newState`

La funcion no toca estado global ni IO; recibe estado + configuracion y retorna el siguiente estado.

### 3.2 Declarativo en UI

React renderiza tableros a partir del estado actual. La UI no calcula reglas de negocio complejas; solo dispara eventos (step/autoplay/reset/cambio de simulacion) y pinta.

### 3.3 OO puntual

Hay uso puntual de orientacion a objetos en `ErrorBoundary` (componente clase de React), pero el modelo de simulacion no es orientado a objetos.

## 4. Arquitectura general

## 4.1 Capas

1. **Configuracion**
- Fuente de verdad: `src/config/defaultConfig.json`
- Parseo y normalizacion: `src/config/defaultConfig.ts`

2. **Dominio tipado**
- Tipos de status, workflow, workitem, estado de simulacion: `src/domain/types.ts`

3. **Motor de simulacion**
- Construccion de estado inicial y evolucion por tick: `src/simulation/engine.ts`

4. **Presentacion**
- Orquestacion de estado y controles: `src/App.tsx`
- Render por nivel/estado/item: `src/components/Board.tsx`, `src/components/Column.tsx`, `src/components/Card.tsx`

## 4.2 Flujo de datos

1. Se carga una simulacion (JSON -> `Config` tipado)
2. Se construye estado inicial (`buildInitialState`)
3. Cada accion Step o tick de Autoplay ejecuta `tick`
4. El nuevo estado se guarda en React y se vuelve a renderizar

## 5. Modelo de dominio implementado

## 5.1 Entidades principales

- **Status**: posicion dentro del workflow (`order`) con metadatos estructurales:
  - `streamType`: UPSTREAM/DOWNSTREAM
  - `isBeforeCommitmentPoint`
  - `isPosDeliveryPoint`
  - `wipLimit?`
  - `hasReadySignal?`
  - `isBuffer?`
- **Workflow**: conjunto ordenado de statuses por nivel (L3..L0)
- **Workitem**: unidad de trabajo con:
  - `id`
  - `level`
  - `statusId`
  - `parentId?`
  - `isReady?`
- **SimState**:
  - `workitems[]`
  - `tick`
  - `idCounters` por nivel
- **Config**:
  - workflows por nivel
  - `initialReleaseCount`
  - `advanceProbability`
  - `childrenPerParent`
  - `demandInterval`

## 5.2 Categorizacion de status

`category` se deriva automaticamente al cargar configuracion:
- UPSTREAM -> TODO
- DOWNSTREAM no final -> IN_PROGRESS
- Ultimo status -> DONE

Esto desacopla la logica de nombres literales de estados.

## 6. Mecanica del motor (tick)

## 6.1 Principios del algoritmo

- Tick discreto con orden fijo de fases
- Maximo una transicion por item por tick
- Reglas jerarquicas por niveles adyacentes (L0->L1->L2->L3)
- Restriccion WIP con contador mutable por fase
- Probabilidad uniforme `advanceProbability`

## 6.2 Helpers estructurales

El motor evita hardcodear nombres de estados. Obtiene claves por propiedades:
- `commitmentId`
- `firstDownstreamId`
- `deliveryOrder`

Asi funciona con simulaciones distintas sin cambiar codigo.

## 6.3 WIP tracker mutable

`makeWipTracker` inicializa conteos por status desde la foto actual de items. Cada transicion aprobada:
- Incrementa conteo del destino
- Decrementa conteo del origen

Esto evita violaciones intra-fase cuando multiples items compiten por una misma columna limitada.

## 6.4 Senal de ready (modelo en dos fases)

Para statuses con `hasReadySignal`:
- **Fase A**: si `isReady` es falso/undefined, el item no avanza; solo marca `isReady: true` (si pasa probabilidad)
- **Fase B**: si `isReady` ya es true, intenta avanzar al siguiente status y luego limpia `isReady`

Para statuses sin ready-signal: avanza normal en un solo paso (si pasa probabilidad y WIP).

## 6.5 Orden de ejecucion por tick (implementado)

El motor actual ejecuta **8 pasos**:

1. **Paso 1 - Avance autonomo L0**
- L0 avanza con probabilidad, respetando entrega y WIP.

2. **Paso 2 - Empuje L1 a primer downstream**
- Si algun hijo L0 esta en downstream, el padre L1 salta a su primer downstream (si WIP permite).

3. **Paso 3 - Reglas de avance L1**
- Si esta en primer downstream, solo avanza cuando todos sus L0 hijos estan en delivery.
- Si esta en commitment, al avanzar crea hijos L0 (una sola vez) y avanza.
- En otros estados, avanza probabilisticamente con reglas de ready y WIP.

4. **Paso 4 - Empuje L2 por actividad de L1**
- Regla analoga al Paso 2, ahora L1 -> L2.

5. **Paso 5 - Reglas de avance L2**
- Analogo a L1, creando hijos L1 en commitment y bloqueando por completitud de hijos en primer downstream.

6. **Paso 6 - Empuje L3 por actividad de L2**
- Regla analoga al Paso 2, ahora L2 -> L3.

7. **Paso 7 - Reglas de avance L3**
- Analogo a L1/L2, creando hijos L2 y bloqueando por completitud de hijos.

8. **Paso 8 - Demanda continua L3**
- Si `demandInterval > 0` y `(tick+1) % demandInterval === 0`, crea un nuevo item L3 en el primer status.

## 6.6 Inicializacion

`buildInitialState(config)`:
- Crea `initialReleaseCount` items L3 en primer status de L3
- Inicializa `idCounters` (L3 arranca en ese valor; L0-L2 en 0)
- `tick` inicia en 0

## 7. Regla de IDs y jerarquia

## 7.1 Prefijo

El prefijo se calcula con las primeras 4 letras de `workitemName` en mayusculas.

## 7.2 Contadores por nivel

`idCounters` mantiene secuencia independiente por nivel.

## 7.3 Sufijo de parent

Si el item tiene padre, el ID agrega `p<parentBaseId>`.
Ejemplo conceptual: `EPIC-2pPROJ-1`.

## 7.4 Creacion de hijos

Al pasar por el status de compromiso (`isBeforeCommitmentPoint`), si no existen hijos previos del nivel inferior:
- Crea `childrenPerParent` hijos
- Los ubica en el primer status del workflow hijo
- Setea `parentId` al id del padre

## 8. Integracion con UI

## 8.1 Estado y control

`App.tsx` mantiene:
- Simulacion seleccionada
- `simState`
- `isPlaying`
- Modos de highlight
- Modo de vista (`portafolio`, `delivery`, `full`)

`Autoplay` ejecuta `tick` cada 1000 ms con `setInterval`.

## 8.2 Presentacion de tableros

- `Board` renderiza un workflow por nivel
- `Column` renderiza status + tarjetas por status
- `Card` renderiza workitem

### Senales visuales relevantes
- WIP en encabezado: `[actual/limite]`
- Commitment subrayado
- Delivery con borde/estilo destacado
- Buffer (`isBuffer`) con marca visual
- Ready (`isReady`) con indicador en tarjeta (excepto en status buffer)

## 9. Diferencias clave entre MVP y estado actual del codigo

1. El MVP describe 7 pasos; la implementacion ejecuta 8 (incluye demanda continua).
2. El MVP no detalla `hasReadySignal` en profundidad; la implementacion aplica una maquina de 2 fases con `isReady`.
3. La UI actual agrega selector de vista por niveles (`portafolio`/`delivery`/`full`).
4. El dominio actual incluye campos adicionales de estado (`isBuffer`, `description`) para visualizacion y semantica operacional.

## 10. Ventajas del enfoque

- Alta configurabilidad: reglas estructurales, no nombres hardcodeados
- Reproducibilidad y testeabilidad por `tick` puro
- Escalabilidad de simulaciones por JSON
- Separacion clara entre motor y presentacion

## 11. Riesgos tecnicos observados

- En `SDF workflows` para L1 hay dos statuses con el mismo `id` (`feat-refining`), lo que puede producir ambiguedad en busquedas por id y comportamiento inesperado en UI/motor.
- El motor usa multiples pasadas sobre el arreglo de items por tick; para volumenes muy altos podria requerir optimizacion adicional.

## 12. Conclusiones

El modelo de simulacion implementado corresponde a una arquitectura **funcional, declarativa y guiada por configuracion**, con un motor de reglas jerarquicas por niveles y restricciones de flujo (WIP + readiness). La evolucion respecto al MVP prioriza realismo operacional (ready-signal y demanda continua) manteniendo un nucleo puro (`tick`) que facilita mantenimiento y extension.
