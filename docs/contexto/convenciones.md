# Convenciones

## Estilo y naming
- Backend en CommonJS; frontend en ESM.
- Controladores: `*Controller.js`.
- Rutas: `*Route.js`.
- Middlewares: nombre descriptivo, normalmente en `Backend/api/middlewares`.
- En frontend, componentes y paginas suelen usar `PascalCase`, aunque hay varios nombres en camelCase por legado.
- Alias de frontend: `@/` apunta a `Frontend/src`.

## Patrones que usamos
- `Frontend/src/services` encapsula las llamadas HTTP.
- `App.jsx` concentra el router y usa `React.lazy` + `Suspense`.
- `Layout.jsx` monta `Navbar` + `Outlet` + `Footer`.
- El backend valida por middleware antes de entrar al controlador.
- Las traducciones viven en `Frontend/public/locales/*/text.json`.
- Las tablas de administracion usan endpoints `admin/*` con `validateJWT` + `validateRol`.

## Cosas que no deberiamos romper
- No mover secretos ni claves de servidor al frontend.
- No subir dependencias que exijan Node 18+; el proyecto fija Node 17.9.1.
- No cambiar las masks de rol sin revisar cliente y backend: `00000000`, `00000001`, `10000000`.
- No saltarse `Authorization: Bearer ...` en llamadas protegidas.
- No tocar `loginTime` como si fuese un `exp` real de JWT: la expiracion actual se calcula en cliente.
- En rutas, controladores y servicios que hagan I/O, captura y loguea errores antes de devolver fallo o relanzarlo.
- En sonificacion, cualquier fallo del backend externo debe quedar registrado y resolverse con respuesta controlada, no con caida del proceso.

## Tests
- No hay suite de tests visible en estas carpetas.
- `Backend/package.json` tiene `npm test` como placeholder que falla a proposito.
- El frontend solo expone `lint`, `build` y `preview`.

## Commits
- El historico reciente usa mensajes cortos y en espanol, normalmente de feature/fix.
- No veo una convencion estricta tipo Conventional Commits.
- Convencion operativa observada: mensaje corto, descriptivo y en espanol, centrado en el cambio real.
