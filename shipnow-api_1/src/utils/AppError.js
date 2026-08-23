/**
 * Error de aplicación con código HTTP asociado.
 * Permite que los Services expresen QUÉ salió mal y con qué status,
 * sin conocer req/res. El Controller solo lee statusCode y responde.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
