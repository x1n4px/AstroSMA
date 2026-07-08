# AstroSMA systemd + PM2

Esta carpeta contiene una variante de los units de `deploy/systemd` preparada para arrancar backend y frontend con `pm2-runtime`.

Notas:
- `astrosma-backend.service` usa PM2 para lanzar `Backend/ecosystem.config.js`.
- `astrosma-frontend.service` usa PM2 para lanzar `Frontend/ecosystem.config.cjs`.
- `astrosma-sonificacion-backend.service` se mantiene con `start.sh` porque ese servicio es Python/Gunicorn y no encaja en PM2.

