import { Router } from 'express';
import { deliveriesController } from '../controllers/deliveries.controller.js';

// El router SOLO conecta cada path con el método del Controller.
const router = Router();

router.get('/', deliveriesController.getDeliveries);
router.get('/:id', deliveriesController.getDeliveryById);

export default router;
