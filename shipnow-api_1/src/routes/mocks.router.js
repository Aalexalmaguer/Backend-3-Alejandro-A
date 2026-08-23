import { Router } from 'express';
import { mocksController } from '../controllers/mocks.controller.js';

// El router SOLO conecta cada path con el método del Controller.
// La lógica de generación vive en el Service y en src/mocks/ (no acá).
const router = Router();

// Inserción controlada en MongoDB
router.post('/seed', mocksController.seed);
router.post('/generateData', mocksController.generateData);

// Preview: datos simulados sin guardar. Ej: GET /api/mocks/users?qty=2
// (va al final para no capturar los paths anteriores)
router.get('/:collection', mocksController.preview);

export default router;
