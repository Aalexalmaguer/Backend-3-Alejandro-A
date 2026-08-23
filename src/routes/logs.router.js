import { Router } from 'express';
import { logsController } from '../controllers/logs.controller.js';

// El router SOLO conecta el path con el método del Controller.
const router = Router();

// GET /api/logs/test → dispara un log de cada nivel
router.get('/test', logsController.test);

export default router;
