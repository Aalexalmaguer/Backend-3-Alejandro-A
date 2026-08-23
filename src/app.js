import express from 'express';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { httpLogger } from './middlewares/httpLogger.js';

/**
 * Construye y configura la aplicación Express.
 * Se separa de server.js para poder testear la app sin levantar el puerto.
 */
export const createApp = () => {
  const app = express();

  // Middlewares base
  app.use(express.json());

  // Logging de cada petición HTTP (nivel 'http')
  app.use(httpLogger);

  // Healthcheck simple
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'ShipNow API activa' });
  });

  // Rutas de la API
  app.use('/api', apiRouter);

  // Ruta no encontrada → deriva un 404 uniforme a la capa de errores
  app.use(notFoundHandler);

  // Manejo centralizado de errores (SIEMPRE al final: es el único que
  // construye la respuesta de error de toda la API)
  app.use(errorHandler);

  return app;
};
