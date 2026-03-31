## 1. Types

- [x] 1.1 Añadir `statusCategory: StatusCategory` al tipo `RawStatus` en `src/domain/types.ts`

## 2. Config Loader

- [x] 2.1 Eliminar la función `assignCategory()` de `src/config/defaultConfig.ts`
- [x] 2.2 Modificar el mapeo de `RawStatus` a `Status` para leer `category` desde `rawStatus.statusCategory`

## 3. JSON — simulación "Simplified"

- [x] 3.1 Añadir `"statusCategory"` a cada status de L3 (4 statuses)
- [x] 3.2 Añadir `"statusCategory"` a cada status de L2 (4 statuses)
- [x] 3.3 Añadir `"statusCategory"` a cada status de L1 (4 statuses)
- [x] 3.4 Añadir `"statusCategory"` a cada status de L0 (4 statuses)

## 4. JSON — simulación "SDF workflows"

- [x] 4.1 Añadir `"statusCategory"` a cada status de L3 (7 statuses)
- [x] 4.2 Añadir `"statusCategory"` a cada status de L2 (10 statuses)
- [x] 4.3 Añadir `"statusCategory"` a cada status de L1 (8 statuses)
- [x] 4.4 Añadir `"statusCategory"` a cada status de L0 (7 statuses)

## 5. Verificación

- [x] 5.1 Compilar el proyecto (`npm run build`) sin errores de TypeScript
- [ ] 5.2 Verificar en el navegador que el botón "Status Category" pinta las columnas con los colores correctos (`#374151` TODO, `#1d4ed8` IN_PROGRESS, `#166534` DONE)
