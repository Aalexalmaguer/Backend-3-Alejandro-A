import { logger } from '../config/logger.js';

/**
 * Middleware de logging HTTP.
 * Registra cada petición con el nivel 'http' al finalizar la respuesta,
 * incluyendo método, ruta, código de estado y duración.
 */
export const httpLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${ms.toFixed(1)}ms`
    );
  });

  next();
};
