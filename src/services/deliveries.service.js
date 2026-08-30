import { deliveriesRepository } from '../repositories/deliveries.repository.js';
import { createError } from '../utils/errors/index.js';
import { buildPaginationMeta } from '../utils/pagination.js';

/**
 * Service de Entregas (lectura).
 * Las entregas se crean vía el módulo de mocks; acá exponemos la consulta.
 */
export const deliveriesService = {
  getDeliveries: async ({ page, limit } = {}) => {
    const result = await deliveriesRepository.paginate({}, { page, limit });
    return { docs: result.docs, pagination: buildPaginationMeta(result) };
  },

  getDeliveryById: async (id) => {
    const delivery = await deliveriesRepository.getById(id);
    if (!delivery) {
      throw createError('DELIVERY_NOT_FOUND');
    }
    return delivery;
  }
};
