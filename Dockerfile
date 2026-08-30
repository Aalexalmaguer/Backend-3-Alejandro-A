# Imagen base de Node (LTS, liviana).
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos primero los manifiestos para aprovechar la caché de capas:
# si no cambian, no se reinstalan las dependencias en cada build.
COPY package*.json ./

# Instalamos SOLO dependencias de producción (sin mocha/supertest, etc.).
RUN npm ci --omit=dev

# Copiamos el resto del proyecto (el .dockerignore excluye lo innecesario/sensible).
COPY . .

# Puerto en el que escucha la API (debe coincidir con PORT).
EXPOSE 8080

# Healthcheck del contenedor: consulta el endpoint /api/health.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

# Arranque de la aplicación.
CMD ["npm", "start"]
