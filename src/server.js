import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import { logger } from './config/logger.js';
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
  try {
    await connectDB();

    const app = createApp();

    app.listen(config.port, () => {
      logger.info(`Servidor ShipNow escuchando en el puerto ${config.port}`);
      logger.info(`Entorno: ${config.nodeEnv}`);
    });
  } catch (error) {
    // Falla crítica durante el arranque: se registra como fatal.
    logger.fatal(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();
