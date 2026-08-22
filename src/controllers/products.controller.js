import { productsService } from '../services/products.service.js';

/**
 * Controller de Productos: única puerta de entrada HTTP.
 * Su trabajo es leer req, llamar al Service y devolver res con el status
 * correcto. No conoce Mongoose ni contiene reglas de negocio.
 */
export const productsController = {
  getProducts: async (req, res, next) => {
    try {
      // ?available=true devuelve solo los productos listos para enviar.
      const products =
        req.query.available === 'true'
          ? await productsService.getAvailableProducts()
          : await productsService.getProducts();

      res.status(200).json({ status: 'success', payload: products });
    } catch (error) {
      next(error);
    }
  },

  getProductById: async (req, res, next) => {
    try {
      const product = await productsService.getProductById(req.params.id);
      res.status(200).json({ status: 'success', payload: product });
    } catch (error) {
      next(error);
    }
  },

  createProduct: async (req, res, next) => {
    try {
      const product = await productsService.createProduct(req.body);
      res.status(201).json({ status: 'success', payload: product });
    } catch (error) {
      next(error);
    }
  },

  updateStock: async (req, res, next) => {
    try {
      const product = await productsService.updateStock(req.params.id, req.body.stock);
      res.status(200).json({ status: 'success', payload: product });
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      await productsService.deleteProduct(req.params.id);
      res.status(200).json({ status: 'success', message: 'Producto eliminado' });
    } catch (error) {
      next(error);
    }
  }
};
