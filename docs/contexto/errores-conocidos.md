# Errores conocidos

- No hay tests automatizados visibles; el `npm test` del backend falla a proposito.
- `isTokenExpired()` no usa el token recibido: mira `localStorage.loginTime`, asi que la expiracion real no depende del `exp` del JWT.
- El login depende de obtener IP desde `api.ipify.org`; si ese fetch falla, el flujo cambia.
- `checkUserBlockedByIp` depende de cabeceras tipo `x-forwarded-for` / `x-real-ip`, que pueden no estar presentes o no ser fiables en todos los entornos.
- `validateRol` considera admin solo a la mask `10000000`.
- `reportZVisibility.js` asume coordenadas en radianes y comenta que los nombres estan intercambiados en `Observatorio`.
- El proxy de sonificacion solo acepta `simple` y `midi`, y solo deja bajar `deteccion-trayectoria.mp4`.
- Hay bastantes consultas SQL largas en controladores; cualquier cambio de schema puede romperlas sin aviso.
- El backend ya registra `unhandledRejection` y `uncaughtException`, pero eso no sustituye revisar la causa raiz si aparecen nuevas caidas.
- No hay suite automatizada visible en estas carpetas; la deteccion de regresiones depende de revisiones manuales y lint/sintaxis.
