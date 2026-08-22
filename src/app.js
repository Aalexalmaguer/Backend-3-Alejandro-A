import express from 'express';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

/**
 * Construye y configura la aplicación Express.
 * Se separa de server.js para poder testear la app sin levantar el puerto.
 */
export const createApp = () => {
  const app = express();

  // Middlewares base
  app.use(express.json());

  // Healthcheck simple
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'ShipNow API activa' });
  });

  // Rutas de la API
  app.use('/api', apiRouter);

  // Manejo centralizado de errores (siempre al final)
  app.use(errorHandler);

  return app;
};
