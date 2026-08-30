import { deliveriesService } from '../services/deliveries.service.js';
import { resolvePageQuery } from '../utils/pagination.js';

/**
 * Controller de Entregas: única puerta de entrada HTTP (lectura).
 */
export const deliveriesController = {
  getDeliveries: async (req, res, next) => {
    try {
      const { page, limit } = resolvePageQuery(req.query);
      const { docs, pagination } = await deliveriesService.getDeliveries({ page, limit });
      res.status(200).json({ status: 'success', payload: docs, pagination });
    } catch (error) {
      next(error);
    }
  },

  getDeliveryById: async (req, res, next) => {
    try {
      const delivery = await deliveriesService.getDeliveryById(req.params.id);
      res.status(200).json({ status: 'success', payload: delivery });
    } catch (error) {
      next(error);
    }
  }
};
