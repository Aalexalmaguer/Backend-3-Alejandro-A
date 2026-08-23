import { Router } from 'express';
import productsRouter from './products.router.js';
import usersRouter from './users.router.js';
import mocksRouter from './mocks.router.js';
import logsRouter from './logs.router.js';

// Router raíz de la API: agrupa cada entidad bajo su path base.
const router = Router();

router.use('/products', productsRouter);
router.use('/users', usersRouter);
router.use('/mocks', mocksRouter);
router.use('/logs', logsRouter);

export default router;
