# =========================================================================
# Dockerfile multi-stage para ShipNow API
# Etapa 1 (deps): instala solo las dependencias de producción.
# Etapa 2 (runtime): imagen final liviana, solo con lo necesario para correr.
# =========================================================================

# ---- Etapa 1: dependencias ----
FROM node:20-alpine AS deps
WORKDIR /app
# Copiamos primero los manifiestos para aprovechar la caché de capas.
COPY package*.json ./
# Instalación reproducible, sin dependencias de desarrollo (mocha, supertest, etc.).
RUN npm ci --omit=dev

# ---- Etapa 2: runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app

# La imagen corre en modo producción por defecto.
ENV NODE_ENV=production

# Traemos las dependencias ya instaladas desde la etapa anterior.
COPY --from=deps /app/node_modules ./node_modules
# Copiamos el código de la app (el .dockerignore excluye lo innecesario/sensible).
COPY . .

# Puerto en el que escucha la API (debe coincidir con PORT).
EXPOSE 8080

# Healthcheck del contenedor: consulta el endpoint /api/health.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

# Arranque de la aplicación.
CMD ["npm", "start"]
