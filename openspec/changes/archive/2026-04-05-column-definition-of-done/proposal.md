## Why

Los usuarios del simulador no tienen forma de consultar la Definition of Done de un estado directamente desde el tablero. Actualmente el campo `description` se muestra como tooltip hover, pero la DoD es información más extensa y pedagógica que merece su propio punto de acceso visible en el header de la columna.

## What Changes

- El tipo `Status` en `domain/types.ts` incorpora el campo opcional `definitionOfDone?: string`.
- `defaultConfig.ts` pasa el campo `definitionOfDone` al procesar los estados (como ya lo hace con otros campos opcionales).
- Los headers de columnas que tengan `definitionOfDone` definido muestran un pequeño botón `"DoD"`. Al hacer click se despliega el texto completo en un panel/tooltip emergente dentro de la columna.
- Columnas sin `definitionOfDone` no muestran ningún botón adicional.

## Capabilities

### New Capabilities

- `column-definition-of-done`: Botón "DoD" en el header de columnas que tienen el campo `definitionOfDone` en la configuración; al hacer click muestra el texto completo del DoD en un panel expandible dentro de la columna.

### Modified Capabilities

- `kanban-board-ui`: El header de columna agrega el botón opcional "DoD" como nuevo elemento visual cuando el campo `definitionOfDone` está presente en el status.
- `simulation-configuration`: El schema de `Status` acepta el nuevo campo opcional `definitionOfDone: string`.

## Impact

- `src/domain/types.ts`: agregar `definitionOfDone?: string` al tipo `Status`.
- `src/config/defaultConfig.ts`: pasar `definitionOfDone` al mapear/derivar statuses (si hay mapeo explícito).
- `src/components/Column.tsx`: agregar estado local de visibilidad del panel DoD, botón en el header y panel condicional con el texto.
- `src/config/defaultConfig.json`: ya contiene el campo en `initiative-funnel`; no requiere cambios adicionales para funcionar.
