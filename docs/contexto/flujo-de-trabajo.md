# Flujo de trabajo

## Para hacer un cambio
1. Localiza si afecta a `Backend`, `DB` o `Frontend`.
2. Si cambia API, toca primero `Backend/api/routes` y `Backend/api/controllers`.
3. Si cambia UI, toca la pagina en `Frontend/src/pages` y su servicio en `Frontend/src/services`.
4. Si cambia texto visible, actualiza `Frontend/public/locales`.
5. Si cambia esquema o datos base, actualiza el SQL correspondiente en `DB/`.
6. Si el frontend necesita una nueva variable, revisa `.env.example` y la exposicion desde backend si aplica.

## Checklist de terminado
- Endpoint probado manualmente.
- Ruta de frontend accesible y sin errores en consola.
- Permisos de rol revisados.
- Traducciones revisadas si habia texto nuevo.
- SQL actualizado si hubo cambio de datos o schema.
- `Frontend` pasa `npm run lint`.
- No se rompe Node 17.9.1.

## Deploy observado en el repo
- Escenario observado para backend: `pm2` ejecuta `npm run dev` desde `Backend/ecosystem.config.js`.
- Escenario observado para frontend: `pm2` ejecuta `npm run start` desde `Frontend/ecosystem.config.cjs`.
- Escenario observado para Vercel: `Backend/vercel.json` reescribe `/(.*)` hacia `/api`.
- No aparece una unica ruta oficial de produccion en el repo; lo documentado aqui son los tres escenarios soportados/observados.
