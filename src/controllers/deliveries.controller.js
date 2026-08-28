import { deliveriesService } from '../services/deliveries.service.js';

/**
 * Controller de Entregas: única puerta de entrada HTTP (lectura).
 */
export const deliveriesController = {
  getDeliveries: async (req, res, next) => {
    try {
      const deliveries = await deliveriesService.getDeliveries();
      res.status(200).json({ status: 'success', payload: deliveries });
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
