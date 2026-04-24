# Frontend AstroSMA

Aplicación React + Vite para visualización de meteoros, informes y workflows.

## Requisitos

- Node.js 17.9.1
- Backend AstroSMA en ejecución

## Configuración

1. Instala dependencias:

```bash
npm ci
```

2. Crea el archivo de entorno:

```bash
cp .env.example .env
```

3. Configura `VITE_API_URL` en `.env`:

```env
VITE_API_URL=http://localhost:3005/api
```

## Desarrollo

```bash
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Nota sobre YouTube Workflows

Las claves de YouTube (`YOUTUBE_API_KEY`, `YOUTUBE_CLIENT_ID`) ya no se definen en el frontend.
Ahora se configuran en el backend y el frontend las obtiene por API.
