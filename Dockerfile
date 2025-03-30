# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Instalar dependencias
RUN npm install
# Instalar bcryptjs para la autenticación
RUN npm install bcryptjs

# Asegurar que el directorio public exista
RUN mkdir -p public
RUN mkdir -p public/data

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Stage 2: Runner
FROM node:18-alpine AS runner

WORKDIR /app

# Configurar para producción
ENV NODE_ENV=production

# Asegurar que existe el directorio para public
RUN mkdir -p public
RUN mkdir -p public/data

# Copiar solo archivos necesarios desde el builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Directorio para datos persistentes
VOLUME /app/public/data

# Exponer puerto
EXPOSE 3000

# Comando para ejecutar
CMD ["npm", "start"] 