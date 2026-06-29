# Arquitectura

## Stack
- Frontend: React 18 + Vite, `react-router-dom`, `i18next`, Bootstrap, Leaflet, Chart.js, `react-three-fiber` y `framer-motion`.
- Backend: Node.js 17.9.1 + Express, `mysql2`, Sequelize, `mongoose`, `jsonwebtoken`, `bcrypt`, `nodemailer`, `exceljs` y `suncalc`.
- Base de datos: MariaDB/MySQL con dumps SQL en `DB/`.

## Mapa rapido de carpetas
- `Backend/api/controllers`: logica de negocio y SQL.
- `Backend/api/routes`: exposicion de endpoints.
- `Backend/api/middlewares`: auth, validaciones y conversion de datos.
- `Backend/api/models`: modelos Sequelize y el modelo Mongo de workflows.
- `Backend/api/services` y `utils`: piezas compartidas.
- `Frontend/src/pages`: pantallas.
- `Frontend/src/components`: UI reutilizable.
- `Frontend/src/services`: cliente HTTP por dominio.
- `Frontend/src/features/workflows`: modulo especifico de workflows.
- `DB/`: dumps, vistas y parches de esquema.

## Flujo de datos
- El navegador llama al backend desde `Frontend/src/services/*`.
- El backend expone todo bajo `/api`.
- La autenticacion usa JWT y `localStorage` (`authToken`, `rol`, `loginTime`).
- MariaDB se consulta con `mysql2` en muchos controladores y con Sequelize en algunos modelos.
- Workflows usa Mongo solo si esta configurado.
- La sonificacion se sirve mediante el backend, que actua como proxy hacia un servicio externo configurado por `SONIFICATION_SERVICE_URL`.

## Que no veo en el repo
- No he visto suite de tests automatizados en `Backend/`, `DB/` o `Frontend/`.
- No he visto migraciones/seeders formales para la base de datos.
- No he visto GraphQL, WebSockets ni Dockerfiles en estas carpetas.
- No he visto una capa unica de ORM para toda la app: conviven SQL directo, Sequelize y Mongo.
