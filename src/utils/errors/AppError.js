import { ERRORS } from './errorDictionary.js';

/**
 * Error personalizado del dominio.
 * Se construye a partir de una entrada del diccionario de errores, de modo que
 * siempre lleva un `code`, un `statusCode` y un `message` coherentes.
 *
 * Las capas (sobre todo los Services) lanzan estos errores; el middleware
 * global es el ÚNICO que los transforma en una respuesta HTTP.
 */
export class AppError extends Error {
  constructor(errorDef, customMessage) {
    super(customMessage || errorDef.message);
    this.name = 'AppError';
    this.code = errorDef.code;
    this.statusCode = errorDef.status;
    // Marca los errores esperados/controlados (vs. bugs inesperados).
    this.isOperational = true;
  }
}

/**
 * Factory: crea un AppError a partir de una clave del diccionario.
 * Ejemplo: throw createError('USER_NOT_FOUND')
 *          throw createError('INVALID_MOCK_QUANTITY', 'qty debe ser un entero > 0')
 */
export const createError = (key, customMessage) => {
  const def = ERRORS[key] || ERRORS.INTERNAL_SERVER_ERROR;
  return new AppError(def, customMessage);
};
