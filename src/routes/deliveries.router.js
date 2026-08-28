import { Router } from 'express';
import { deliveriesController } from '../controllers/deliveries.controller.js';
import { filesController } from '../controllers/files.controller.js';
import { ensureDeliveryExists } from '../middlewares/entityExists.js';
import { uploadSingle, UPLOAD_SUBDIRS } from '../config/multer.js';

// El router SOLO conecta cada path con el método del Controller.
const router = Router();

router.get('/', deliveriesController.getDeliveries);
router.get('/:id', deliveriesController.getDeliveryById);

// Carga de comprobante (M7): valida entrega → sube archivo → registra metadatos.
router.post(
  '/:id/receipts',
  ensureDeliveryExists,
  uploadSingle(UPLOAD_SUBDIRS.DELIVERY_PROOFS),
  filesController.uploadDeliveryReceipt
);

export default router;
