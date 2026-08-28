import { ordersService } from '../services/orders.service.js';

/**
 * Controller de Pedidos: única puerta de entrada HTTP (lectura).
 */
export const ordersController = {
  getOrders: async (req, res, next) => {
    try {
      const orders = await ordersService.getOrders();
      res.status(200).json({ status: 'success', payload: orders });
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, res, next) => {
    try {
      const order = await ordersService.getOrderById(req.params.id);
      res.status(200).json({ status: 'success', payload: order });
    } catch (error) {
      next(error);
    }
  }
};
