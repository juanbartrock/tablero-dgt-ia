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
- Sistema de notificaciones en tiempo real
- Registro de visitas y actividad de usuarios
- Base de datos PostgreSQL con esquema optimizado

## Tecnologías

- Next.js 14+
- TypeScript
- Tailwind CSS
- Recharts para gráficos
- Docker y Docker Compose
- PostgreSQL
- Drizzle ORM
- API de Google Sheets
- Sistema de autenticación personalizado

## Requisitos previos

- Docker y Docker Compose instalados en su sistema
- Node.js 18+ (solo para desarrollo local)
- PostgreSQL (incluido en Docker Compose)

## Estructura de la Base de Datos

El sistema utiliza PostgreSQL con las siguientes tablas principales:

- `users`: Gestión de usuarios y autenticación
- `tasks`: Almacenamiento de tareas y su estado
- `visits`: Registro de actividad de usuarios
- `notifications`: Sistema de notificaciones
- `notification_views`: Seguimiento de notificaciones vistas

## Ejecución con Docker

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_DIRECTORIO]
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con las configuraciones necesarias
```

3. Iniciar con Docker Compose:
```bash
docker-compose up -d
```

4. Acceder a la aplicación:
```
http://localhost:3000
```

## Desarrollo local

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con las configuraciones necesarias
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

4. Acceder a la aplicación en `http://localhost:3000`

## Estructura del proyecto

- `/app` - Código fuente de la aplicación Next.js
  - `/admin` - Panel de administración
  - `/api` - Endpoints de la API
  - `/auth` - Configuración de autenticación
  - `/components` - Componentes reutilizables
  - `/lib` - Datos y utilidades
    - `/auth` - Utilidades de autenticación
    - `/db` - Configuración y funciones de base de datos
    - `api-client.ts` - Cliente para comunicación con APIs
    - `google-sheets-client.ts` - Cliente para integración con Google Sheets
    - `notification.ts` - Sistema de notificaciones
    - `types.ts` - Tipos TypeScript
  - `/login` - Página de inicio de sesión
- `/data` - Archivos JSON para desarrollo
- `/public` - Archivos estáticos
- `/sql` - Scripts SQL y esquemas de base de datos
- `Dockerfile` - Configuración para Docker
- `docker-compose.yml` - Configuración para Docker Compose
- `.dockerignore` - Archivos a ignorar en la build de Docker

## Seguridad

- Autenticación mediante cookies seguras
- Contraseñas hasheadas con bcrypt
- Protección de rutas mediante middleware
- Validación de sesiones en cada petición

## Mantenimiento

- La base de datos se inicializa automáticamente al primer inicio
- Se ejecuta un cron job diario para verificar la integridad de la base de datos
- Las notificaciones se gestionan automáticamente

## Soporte

Para reportar problemas o solicitar nuevas características, por favor crear un issue en el repositorio. 