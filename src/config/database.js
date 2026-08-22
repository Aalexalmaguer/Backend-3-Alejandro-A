import mongoose from 'mongoose';
import { config } from './index.js';

/**
 * Conexión centralizada a MongoDB.
 * La cadena de conexión llega ya validada desde config; este módulo es el
 * único responsable de abrir la conexión con Mongoose.
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[db] Conectado a MongoDB');
  } catch (error) {
    console.error('[db] No se pudo conectar a MongoDB:', error.message);
    // Sin base de datos la API no puede operar: cortamos el proceso.
    process.exit(1);
  }
};
