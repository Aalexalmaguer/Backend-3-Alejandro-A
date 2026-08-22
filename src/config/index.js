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
export const config = Object.freeze({
  port: Number(process.env.PORT) || 8080,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production'
});
