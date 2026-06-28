# Tareas

> Cola viva del proyecto. Cuando no haya tareas `En progreso`, toma la primera `Pendiente` de mayor prioridad.

## Metadatos
- Fecha de creación: 2026-06-28
- Última actualización: 2026-06-28

## Instrucciones
- Actualiza esta tabla cada vez que cambie el estado de una tarea.
- Si detectas trabajo nuevo, añade una fila nueva en `Pendientes`.
- Si una tarea queda parcialmente resuelta, mantenla en `En progreso` con contexto explícito.
- Si una tarea no puede continuar, muévela a `Bloqueadas` y explica el motivo.

## En progreso

| ID | Prioridad | Estado | Contexto | Criterios de aceptación | Archivos relacionados | Creación | Última actualización |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [PENDIENTE] | [PENDIENTE] | Vacío | No hay tareas en progreso ahora mismo. | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |

## Pendientes

| ID | Prioridad | Estado | Contexto | Criterios de aceptación | Archivos relacionados | Creación | Última actualización |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [PENDIENTE] | [PENDIENTE] | Vacío | No hay tareas pendientes ahora mismo. | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |

## Bloqueadas

| ID | Prioridad | Estado | Contexto | Criterios de aceptación | Archivos relacionados | Creación | Última actualización |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [PENDIENTE] | [PENDIENTE] | Vacío | No hay tareas bloqueadas ahora mismo. | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |

## Completadas

| ID | Prioridad | Estado | Contexto | Criterios de aceptación | Archivos relacionados | Creación | Última actualización |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-0001 | Alta | Completada | Se creó la base operativa del proyecto con documentos de contexto en `docs/contexto/`. | Existen los 6 documentos de contexto y están restringidos al alcance `Backend/`, `DB/` y `Frontend/`. | `docs/contexto/arquitectura.md`, `docs/contexto/convenciones.md`, `docs/contexto/decisiones.md`, `docs/contexto/errores-conocidos.md`, `docs/contexto/flujo-de-trabajo.md`, `docs/contexto/glosario.md` | 2026-06-28 | 2026-06-28 |
| T-0002 | Alta | Completada | Se reforzaron las fronteras de error en backend y sonificación con handlers globales, captura en `fileController` y logging en el servicio frontend de sonificación. | El servicio no se cae por errores no capturados en las rutas revisadas; los fallos quedan logueados; sonificación falla de forma controlada; no se rompen rutas existentes. | `Backend/api/index.ts`, `Backend/api/controllers/fileController.js`, `Frontend/src/services/sonificationService.jsx` | 2026-06-28 | 2026-06-28 |
| T-0003 | Alta | Completada | `Backend/api/models/index.js` se alineó con las variables `DB_*` del resto del backend y dejó de usar credenciales/host hardcodeados. | La conexión usa variables de entorno y no hay secretos ni valores fijos en código. | `Backend/api/models/index.js`, `Backend/api/database/connection.js`, `Backend/.env.example` | 2026-06-28 | 2026-06-28 |
| T-0004 | Media | Completada | Se documentaron los escenarios de despliegue observados en el repo: PM2 para backend, PM2 para frontend y rewrite de Vercel hacia `/api`. | Queda documentada una única ruta preferente o se explican claramente los escenarios soportados. | `Backend/ecosystem.config.js`, `Backend/vercel.json`, `Frontend/ecosystem.config.cjs`, `docs/contexto/flujo-de-trabajo.md` | 2026-06-28 | 2026-06-28 |
| T-0005 | Media | Completada | Se cerró el glosario con las siglas visibles en el catálogo `meteor_showers` y en las tablas científicas del repo. | Cada sigla queda definida o marcada como no verificable con evidencia del repo. | `docs/contexto/glosario.md`, `DB/update_bd.sql`, `Backend/api/controllers/adminScientificTableController.js` | 2026-06-28 | 2026-06-28 |
| T-0006 | Media | Completada | Se dejó una convención operativa para commits y una estrategia mínima de verificación basada en revisión manual, lint y chequeo de sintaxis. | Queda una decisión explícita o se añade el proceso recomendado con límites claros. | `docs/contexto/convenciones.md`, `docs/contexto/errores-conocidos.md`, `Backend/package.json`, `Frontend/package.json` | 2026-06-28 | 2026-06-28 |
| T-0007 | Media | Completada | Se añadieron units `systemd` para Backend, Frontend y `sonificacion-backend`, con reinicio automático ante fallos y nota de despliegue en el README. | Existen los tres `.service`, se documenta cómo instalarlos y el reinicio automático queda explícito. | `deploy/systemd/astrosma-backend.service`, `deploy/systemd/astrosma-frontend.service`, `deploy/systemd/astrosma-sonificacion-backend.service`, `README.md` | 2026-06-28 | 2026-06-28 |
| T-0008 | Media | Completada | Se comparo `sonificacion-backend/endpoint.py` con `sonificacion-backend/new/endpoint.py` y se confirmo que la version activa es la de `endpoint.py`; la copia de `new/` queda como referencia historica. | La comparacion queda registrada y no se sustituye el endpoint estable por la copia antigua. | `sonificacion-backend/endpoint.py`, `sonificacion-backend/new/endpoint.py`, `docs/contexto/decisiones.md` | 2026-06-28 | 2026-06-28 |
| T-0009 | Alta | Completada | Se endurecio la integracion de `sonificacion-backend` para aceptar solo rutas mapeadas al arbol permitido de detecciones y para tratar enlaces simbolicos de forma segura al limpiar el runtime. | Una ruta maliciosa o fuera de arbol se rechaza; el runtime no puede borrarse por enlaces simbolicos; la compilacion sintactica sigue pasando. | `sonificacion-backend/endpoint.py`, `docs/contexto/decisiones.md` | 2026-06-28 | 2026-06-28 |
| T-0010 | Media | Completada | Se eliminaron `sonificacion-repo/` y `sonificacion-backend/new/` del repo activo para dejar una unica fuente integrada y evitar confusiones futuras. | No quedan restos de esas copias en el arbol del proyecto y la documentacion refleja la decision. | `docs/contexto/decisiones.md` | 2026-06-28 | 2026-06-28 |
