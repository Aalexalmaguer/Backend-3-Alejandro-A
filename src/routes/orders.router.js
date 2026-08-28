import { Router } from 'express';
import { ordersController } from '../controllers/orders.controller.js';
import { filesController } from '../controllers/files.controller.js';
import { ensureOrderExists } from '../middlewares/entityExists.js';
import { uploadSingle, UPLOAD_SUBDIRS } from '../config/multer.js';

// El router SOLO conecta cada path con el método del Controller.
const router = Router();

router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/', ordersController.createOrder);
router.patch('/:id/status', ordersController.updateStatus);

// Carga de comprobante (M7): valida pedido → sube archivo → registra metadatos.
router.post(
  '/:id/receipts',
  ensureOrderExists,
  uploadSingle(UPLOAD_SUBDIRS.DELIVERY_PROOFS),
  filesController.uploadOrderReceipt
);

export default router;
