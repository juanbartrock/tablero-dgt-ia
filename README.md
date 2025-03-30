# Dashboard de Estado de Tareas

Aplicación web interna para visualizar el estado de tareas del equipo, proporcionando una vista consolidada y visualmente atractiva para la Dirección del Área.

## Características

- Dashboard con KPIs y gráficos visuales
- Vista de tareas pendientes y terminadas
- Visualización de distribución por estado, prioridad y responsable
- Alerta visual de tareas próximas a vencer
- Diseño responsivo y moderno
- Sistema de autenticación de usuarios
- Panel de administración para gestión de datos
- Completamente dockerizado
- Integración con Google Sheets para importación de datos
- Sistema de notificaciones

## Tecnologías

- Next.js 14+
- TypeScript
- Tailwind CSS
- Recharts para gráficos
- Docker
- API de Google Sheets
- JSON Server para datos de desarrollo

## Requisitos previos

- Docker instalado en su sistema
- Node.js 18+ (solo para desarrollo local)

## Ejecución con Docker

1. Construir la imagen Docker:

```bash
docker build -t dashboard-tareas:latest .
```

2. Ejecutar el contenedor:

```bash
docker run -p 3000:3000 dashboard-tareas:latest
```

También puede utilizar docker-compose:

```bash
docker-compose up -d
```

3. Acceder a la aplicación en su navegador:

```
http://localhost:3000
```

## Desarrollo local

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar servidor de desarrollo:

```bash
npm run dev
```

3. Acceder a la aplicación en `http://localhost:3000`

## Estructura del proyecto

- `/app` - Código fuente de la aplicación Next.js
  - `/admin` - Panel de administración
  - `/api` - Endpoints de la API
  - `/auth` - Configuración de autenticación
  - `/components` - Componentes reutilizables
  - `/lib` - Datos y utilidades
    - `/auth` - Utilidades de autenticación
    - `api-client.ts` - Cliente para comunicación con APIs
    - `db.ts` - Funciones de acceso a datos
    - `google-sheets-client.ts` - Cliente para integración con Google Sheets
    - `notification.ts` - Sistema de notificaciones
    - `types.ts` - Tipos TypeScript
  - `/login` - Página de inicio de sesión
- `/data` - Archivos JSON para desarrollo
- `/public` - Archivos estáticos
- `Dockerfile` - Configuración para Docker
- `docker-compose.yml` - Configuración para Docker Compose
- `.dockerignore` - Archivos a ignorar en la build de Docker 