import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

// El router SOLO conecta el path con el método del Controller.
const router = Router();

router.get('/', healthController.check);

export default router;
