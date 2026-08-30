import { ordersService } from '../services/orders.service.js';
import { resolvePageQuery } from '../utils/pagination.js';

/**
 * Controller de Pedidos: única puerta de entrada HTTP.
 */
export const ordersController = {
  getOrders: async (req, res, next) => {
    try {
      const { page, limit } = resolvePageQuery(req.query);
      const { docs, pagination } = await ordersService.getOrders({ page, limit });
      res.status(200).json({ status: 'success', payload: docs, pagination });
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
  },

  createOrder: async (req, res, next) => {
    try {
      const order = await ordersService.createOrder(req.body);
      res.status(201).json({ status: 'success', payload: order });
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const order = await ordersService.updateStatus(req.params.id, req.body.status);
      res.status(200).json({ status: 'success', payload: order });
    } catch (error) {
      next(error);
    }
  }
};
