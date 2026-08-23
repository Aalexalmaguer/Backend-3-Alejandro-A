import { AppError, createError, ERRORS } from '../utils/errors/index.js';

/**
 * Normaliza cualquier error a un AppError.
 * Los errores esperados ya llegan como AppError (lanzados por los Services).
 * Los inesperados de Mongoose se traducen a errores del diccionario para que
 * el cliente nunca vea un stack trace ni un 500 genérico cuando no corresponde.
 */
const normalizeError = (err) => {
  if (err instanceof AppError) return err;

  // Id con formato inválido (ej. /products/123-no-es-objectid)
  if (err?.name === 'CastError') {
    return createError('INVALID_ID', `El id "${err.value}" no es válido`);
  }

  // Violación de esquema de Mongoose
  if (err?.name === 'ValidationError') {
    const detail = Object.values(err.errors || {})
      .map((e) => e.message)
      .join('; ');
    return createError('VALIDATION_ERROR', detail || undefined);
  }

  // Índice único duplicado (ej. email repetido)
  if (err?.code === 11000) {
    return createError('DUPLICATE_EMAIL');
  }

  // Cualquier otra cosa: error interno no controlado
  return createError('INTERNAL_SERVER_ERROR');
};

/**
 * Middleware GLOBAL de errores.
 * Es el ÚNICO lugar que construye la respuesta de error del proyecto, con una
 * estructura uniforme: { status, error: { code, message } }.
 */
export const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  // Solo logueamos en el servidor los errores inesperados (5xx).
  if (error.statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(error.statusCode).json({
    status: 'error',
    error: {
      code: error.code,
      message: error.message
    }
  });
};

/**
 * Middleware para rutas inexistentes: deriva un 404 uniforme a la capa de
 * errores en lugar de dejar que Express responda su HTML por defecto.
 */
export const notFoundHandler = (req, res, next) => {
  next(new AppError(ERRORS.ROUTE_NOT_FOUND, `No existe la ruta ${req.method} ${req.originalUrl}`));
};
