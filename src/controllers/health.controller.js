import mongoose from 'mongoose';
import { config } from '../config/index.js';

/**
 * Controller de health check.
 * Devuelve el estado de la API SIN exponer información sensible (nunca la URI
 * de la base, secretos, etc.). Útil para monitoreo y para Docker/orquestadores.
 */
export const healthController = {
  check: (req, res) => {
    const dbConnected = mongoose.connection?.readyState === 1;
    res.status(200).json({
      status: 'success',
      data: {
        status: 'ok',
        environment: config.nodeEnv,
        database: dbConnected ? 'connected' : 'disconnected',
        uptime: Math.round(process.uptime()), // segundos que lleva viva la app
        timestamp: new Date().toISOString()
      }
    });
  }
};
