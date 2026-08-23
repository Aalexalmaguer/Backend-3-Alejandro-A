import { Router } from 'express';
import { productsController } from '../controllers/products.controller.js';

// El router SOLO conecta cada path con el método del Controller.
// Sin lógica de negocio, sin validaciones, sin acceso a datos.
const router = Router();

router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);
router.post('/', productsController.createProduct);
router.patch('/:id/stock', productsController.updateStock);
router.delete('/:id', productsController.deleteProduct);

export default router;
