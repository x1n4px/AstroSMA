# Decisiones

- Node 17.9.1 se mantiene como limite de compatibilidad, porque el README avisa que el servidor no se puede actualizar.
- Las claves que antes vivian en frontend se movieron al backend y se exponen por `/api/auxiliary/client-config`.
- La autenticacion se apoyo en JWT + `localStorage` en vez de una sesion server-side.
- La caducidad de sesion se controla en cliente con `loginTime`, no con `exp` del token.
- Los roles se codifican con masks binarias: `QR=00000000`, `BASIC=00000001`, `ADMIN=10000000`.
- Las consultas de `Informe_Z` se filtran por visibilidad geometrica con `MAX_DISTANCE_OBSERVATORIO` y distancia esferica calculada en SQL.
- `established_meteor_showers` se conserva como vista de compatibilidad que apunta a `meteor_showers`, en lugar de romper consultas antiguas.
- Los workflows guardan vistas en Mongo solo si hay configuracion disponible, en vez de obligar a Mongo siempre.
- La sonificacion se resolvio como proxy del backend hacia un servicio externo, no como llamada directa desde el navegador.
- En commits recientes se ve la priorizacion de correcciones de datos y consultas antes que refactors grandes.
- La configuracion de Sequelize en `Backend/api/models/index.js` se alineo con las variables `DB_*` del resto del backend para evitar credenciales y host hardcodeados.
- No hay una unica ruta oficial de despliegue en el repo; quedan documentados los escenarios observados: PM2 para backend, PM2 para frontend y rewrite de Vercel hacia `/api`.
- `sonificacion-backend/endpoint.py` es la fuente de verdad activa; `sonificacion-backend/new/endpoint.py` se trata como copia de trabajo o referencia historica y no como destino de despliegue.
- El backend de sonificacion solo acepta rutas de informe que se puedan mapear al arbol permitido de detecciones; si la BD propone una ruta fuera de ese arbol, se rechaza en vez de copiar o servir contenido arbitrario.
- La limpieza del runtime de sonificacion trata los enlaces simbolicos como enlaces, no como directorios, para evitar borrados accidentales fuera del area de trabajo.
- `sonificacion-repo/` y `sonificacion-backend/new/` se eliminaron del repo activo despues de verificar la integracion, para evitar confusiones con copias de referencia.
- La asociacion de lluvias activas en `/report` se resuelve agrupando por codigo canónico de familia y calculando la actividad IAU con la longitud ecliptica solar estimada en backend, en vez de una ventana fija de fechas o un CSV externo no versionado.
