/**
 * Middleware centralizado de manejo de errores.
 * Los Controllers derivan cualquier error acá con next(error).
 * Si es un AppError, respeta su statusCode; si no, responde 500.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Error interno del servidor';

  if (statusCode === 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({ status: 'error', error: message });
};
