# AstroUMA
# Visualización e Inferencia de Datos de Lluvias de Meteoros

## Flujo de agente y documentos

Este repositorio usa un punto de entrada operativo para agentes de IA:

1. Lee primero [`AGENT.md`](AGENT.md).
2. Revisa después los documentos de contexto en `docs/contexto/`:
   - [`arquitectura.md`](docs/contexto/arquitectura.md)
   - [`convenciones.md`](docs/contexto/convenciones.md)
   - [`decisiones.md`](docs/contexto/decisiones.md)
   - [`errores-conocidos.md`](docs/contexto/errores-conocidos.md)
   - [`flujo-de-trabajo.md`](docs/contexto/flujo-de-trabajo.md)
   - [`glosario.md`](docs/contexto/glosario.md)
3. Consulta [`tareas.md`](tareas.md) para ver la cola viva de trabajo.
4. Ejecuta la siguiente tarea pendiente o en progreso según prioridad.
5. Tras cambiar código o datos, actualiza también los documentos afectados y el estado de la tarea.

Si faltan datos verificables, el agente debe dejar un `PENDIENTE` en el documento correspondiente en vez de inventar.

> **Aviso de compatibilidad del servidor:** la version de Node.js del servidor es `17.9.1`, la misma que aparece en el error original (`Node.js v17.9.1`). El servidor no se puede actualizar, asi que los desarrollos futuros deben mantener compatibilidad con Node `17.9.1` y evitar actualizar dependencias que requieran Node 18, 20 o 22.

Este proyecto tiene como objetivo desarrollar una plataforma web interactiva para visualizar y analizar los datos de lluvias de meteoros recopilados por la Universidad de Málaga (UMA) y la Sociedad Malagueña de Astronomía (SMA), en colaboración con el profesor Alberto Castellón Serrano.

## Contexto

La UMA y la SMA han creado una base de datos que registra la información de la identificación y monitoreo de lluvias de meteoros. Sin embargo, el análisis y la representación gráfica de estos datos pueden ser complicados debido a su volumen, diversidad y formato. Este Trabajo de Fin de Grado (TFG) busca solucionar este problema mediante la creación de una plataforma web accesible e intuitiva.

## Objetivos

* Desarrollar una aplicación web interactiva que se conecte a la base de datos de la UMA/SMA.
* Implementar visualizaciones de datos sofisticadas para facilitar la comprensión de la información.
* Aplicar métodos de análisis de datos para identificar patrones y tendencias en las lluvias de meteoros.
* Promover la divulgación científica, permitiendo a investigadores y aficionados explorar los datos fácilmente.

## Tecnologías Utilizadas

* **Frontend:** React
* **Backend:** Node.js
* **Base de Datos:** MariaDB

## Funcionalidades Principales

* Visualización interactiva de datos de lluvias de meteoros.
* Herramientas de análisis para identificar patrones y tendencias.
* Interfaz intuitiva y fácil de usar para investigadores y aficionados.
* Divulgación científica a través de la exploración de datos.

## Contribución

Este TFG se basa en trabajos previos sobre recolección de datos astronómicos, pero va más allá al ofrecer una solución tecnológica que centraliza, procesa y muestra la información de manera eficiente. A diferencia de los métodos anteriores, esta plataforma proporciona una herramienta sofisticada para la interpretación de datos, impulsando el conocimiento en el campo de la astronomía y fomentando la divulgación científica.

## Instalación

Requisito previo: Node.js 17.9.1. En el servidor Manjaro, si usas `nvm`, ejecuta:

```bash
nvm install
nvm use
```

1. Clona el repositorio:

```bash
git clone https://github.com/x1n4px/AstroUMA.git
cd AstroUMA
```

2. Prepara la base de datos MariaDB/MySQL:

```sql
CREATE USER 'astro_user'@'localhost' IDENTIFIED BY '0000';
CREATE DATABASE astro;
GRANT ALL PRIVILEGES ON astro.* TO 'astro_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Backend:

```bash
cd Backend
npm ci
cp .env.example .env
```

Configura al menos estas variables en `Backend/.env`:

```env
PORT=3005
JWT_SECRET=change_this_jwt_secret
DB_HOST=localhost
DB_USER=astro_user
DB_PASSWORD=0000
DB_NAME=astro
MAX_DISTANCE_OBSERVATORIO=15
```

Opcional (subida a YouTube desde Workflows):

```env
YOUTUBE_API_KEY=
YOUTUBE_CLIENT_ID=
```

Opcional (MongoDB para vistas de workflows):

```env
MONGO_URL=
MONGO_HOST=
MONGO_PORT=27017
MONGO_DB=sma_workflows
MONGO_USERNAME=
MONGO_PASSWORD=
```

Opcional (publicación en WordPress):

```env
WORDPRESS_ENABLED=false
WORDPRESS_BASE_URL=https://meteoros.astromalaga.es
WORDPRESS_USERNAME=
WORDPRESS_PASSWORD=
WORDPRESS_DEFAULT_AUTHOR=
WORDPRESS_DEFAULT_STATUS=draft
WORDPRESS_DEFAULT_CATEGORY=
WORDPRESS_DEFAULT_TAGS=AstroSMA,Workflows,Meteoros
WORDPRESS_TIMEOUT=30000
```

Nota: estas claves ahora se leen desde el backend y se exponen al cliente por `GET /api/auxiliary/client-config`. Ya no se configuran en el `.env` del frontend.

4. Frontend:

```bash
cd ../Frontend
npm ci
cp .env.example .env
```

Configura `Frontend/.env`:

```env
VITE_API_URL=http://localhost:3005/api
```

5. Sonificacion:

```bash
cd ../sonificacion-backend
cp .env.example .env
./start.sh
```

Este servidor lee las detecciones desde:

```text
/home/in4p/git/sma/tfg-pub/Detecciones
```

`./start.sh` crea la venv e instala dependencias si hace falta, y usa Gunicorn por defecto para producción. Si quieres arrancarlo en modo desarrollo, usa:

```bash
SONIFICATION_MODE=dev ./start.sh
```

## Despliegue con systemd

Para dejar los tres servicios levantando solos al arrancar el servidor, usa los units de `deploy/systemd/`.

### Instalación del despliegue

1. Revisa que la ruta del repositorio y el usuario del sistema coincidan con los de los units.
2. Copia los `.service` al directorio de `systemd`:

```bash
sudo cp deploy/systemd/*.service /etc/systemd/system/
```

3. Recarga la configuración de `systemd`:

```bash
sudo systemctl daemon-reload
```

4. Habilita y arranca los servicios:

```bash
sudo systemctl enable --now astrosma-backend.service
sudo systemctl enable --now astrosma-frontend.service
sudo systemctl enable --now astrosma-sonificacion-backend.service
```

5. Comprueba el estado:

```bash
systemctl status astrosma-backend.service
systemctl status astrosma-frontend.service
systemctl status astrosma-sonificacion-backend.service
```

6. Para ver logs en tiempo real:

```bash
journalctl -u astrosma-backend.service -f
journalctl -u astrosma-frontend.service -f
journalctl -u astrosma-sonificacion-backend.service -f
```

Los units usan `Restart=on-failure`, así que systemd los reintentará si fallan por un error no controlado.

### Units incluidos

- `deploy/systemd/astrosma-backend.service`
- `deploy/systemd/astrosma-frontend.service`
- `deploy/systemd/astrosma-sonificacion-backend.service`

Si tu usuario o la ruta del repositorio cambian, ajusta `User=` y `WorkingDirectory=` en cada `.service`.

6. Arranque en local:

En una terminal (backend):

```bash
cd Backend
npm run dev
```

En otra terminal (frontend):

```bash
cd Frontend
npm run dev
```

7. Despliegue básico con PM2 (opcional):

Backend:

```bash
pm2 start npm --name backend -- run dev
```

Frontend:

```bash
cd Frontend
npm run build
pm2 serve dist 5173 --name frontend
```



## Uso

1.  Abre la aplicación web en tu navegador.
2.  Explora las visualizaciones de datos y utiliza las herramientas de análisis.
3.  Familiarízate con los patrones y tendencias de las lluvias de meteoros.
