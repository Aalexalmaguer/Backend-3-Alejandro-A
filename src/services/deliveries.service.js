import { deliveriesRepository } from '../repositories/deliveries.repository.js';
import { createError } from '../utils/errors/index.js';

/**
 * Service de Entregas (lectura).
 * Las entregas se crean vía el módulo de mocks; acá exponemos la consulta.
 */
export const deliveriesService = {
  getDeliveries: async () => {
    return deliveriesRepository.getAll();
  },

  getDeliveryById: async (id) => {
    const delivery = await deliveriesRepository.getById(id);
    if (!delivery) {
      throw createError('DELIVERY_NOT_FOUND');
    }
    return delivery;
  }
};
