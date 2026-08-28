import { Router } from 'express';
import { ordersController } from '../controllers/orders.controller.js';

// El router SOLO conecta cada path con el método del Controller.
const router = Router();

router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);

export default router;
