import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import { createApp } from './app.js';

/**
 * Punto de arranque de ShipNow.
 * Orden importante:
 *  1. Importar config valida las variables de entorno críticas (si falta
 *     MONGODB_URI, el proceso corta acá con un error descriptivo).
 *  2. Conectar a MongoDB.
 *  3. Recién entonces escuchar peticiones HTTP.
 */
const startServer = async () => {
  await connectDB();

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[server] ShipNow escuchando en http://localhost:${config.port}`);
    console.log(`[server] Entorno: ${config.nodeEnv}`);
  });
};

startServer();
