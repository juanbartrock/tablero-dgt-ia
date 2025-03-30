# Dashboard de Estado de Tareas

Aplicación web interna para visualizar el estado de tareas del equipo, proporcionando una vista consolidada y visualmente atractiva para la Dirección del Área.

## Características

- Dashboard con KPIs y gráficos visuales
- Vista de tareas pendientes y terminadas
- Visualización de distribución por estado, prioridad y responsable
- Alerta visual de tareas próximas a vencer
- Diseño responsivo y moderno
- Completamente dockerizado

## Tecnologías

- Next.js 14+
- TypeScript
- Tailwind CSS
- Recharts para gráficos
- Docker

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
  - `/components` - Componentes reutilizables
  - `/lib` - Datos y utilidades
- `/public` - Archivos estáticos
- `Dockerfile` - Configuración para Docker
- `.dockerignore` - Archivos a ignorar en la build de Docker 