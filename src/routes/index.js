import { Router } from 'express';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import productsRouter from './products.router.js';
import usersRouter from './users.router.js';
import ordersRouter from './orders.router.js';
import deliveriesRouter from './deliveries.router.js';
import mocksRouter from './mocks.router.js';
import logsRouter from './logs.router.js';
import healthRouter from './health.router.js';

// Router raíz de la API: agrupa cada entidad bajo su path base.
const router = Router();

// Siempre disponibles (incluido producción).
router.use('/health', healthRouter);
router.use('/products', productsRouter);
router.use('/users', usersRouter);
router.use('/orders', ordersRouter);
router.use('/deliveries', deliveriesRouter);

/**
 * Endpoints internos (herramientas de desarrollo): /mocks y /logs.
 * CRITERIO: quedan DESHABILITADOS en producción, salvo que se active
 * explícitamente con ENABLE_INTERNAL_ENDPOINTS=true. Así no se exponen
 * la generación de datos de prueba ni el disparador de logs en un entorno real.
 */
if (config.enableInternalEndpoints) {
  router.use('/mocks', mocksRouter);
  router.use('/logs', logsRouter);
} else {
  logger.info('Endpoints internos (/mocks, /logs) deshabilitados en este entorno');
}

export default router;
