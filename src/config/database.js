import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from './logger.js';

/**
 * Conexión centralizada a MongoDB.
 * La cadena de conexión llega ya validada desde config; este módulo es el
 * único responsable de abrir la conexión con Mongoose.
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Conexión a MongoDB establecida');
  } catch (error) {
    // Sin base de datos la API no puede operar: falla crítica.
    logger.fatal(`Error al conectar con MongoDB: ${error.message}`);
    process.exit(1);
  }
};
