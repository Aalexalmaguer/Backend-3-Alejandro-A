import dotenv from 'dotenv';

// Cargamos las variables definidas en el archivo .env hacia process.env
dotenv.config();

/**
 * Variables de entorno CRÍTICAS: sin ellas la aplicación no tiene sentido y
 * no debe arrancar. Si falta alguna, cortamos el arranque con un error claro
 * en lugar de fallar más tarde con un mensaje confuso (ej. al conectar a Mongo).
 */
const REQUIRED_ENV_VARS = ['MONGODB_URI'];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(
    `[config] Faltan variables de entorno obligatorias: ${missingVars.join(', ')}. ` +
      'Revisá tu archivo .env (podés guiarte con .env.example).'
  );
}

/**
 * Único punto del proyecto que lee process.env.
 * El resto de la aplicación importa "config" desde acá y trabaja con valores
 * ya validados y con sus defaults resueltos.
 */
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

export const config = Object.freeze({
  port: Number(process.env.PORT) || 8080,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv,
  isProduction,
  // Nivel de logs: por defecto según el entorno; se puede forzar con LOG_LEVEL.
  logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  // Opcionales (para cuando se agregue auth / servicios externos). No son
  // críticos: la app arranca sin ellos, pero se leen SIEMPRE desde acá.
  jwtSecret: process.env.JWT_SECRET || null,
  externalServiceUrl: process.env.EXTERNAL_SERVICE_URL || null,
  // Si en producción se exponen los endpoints internos (mocks / logger test).
  // Por defecto quedan DESHABILITADOS en producción (son herramientas de dev).
  enableInternalEndpoints: process.env.ENABLE_INTERNAL_ENDPOINTS === 'true' || !isProduction
});
