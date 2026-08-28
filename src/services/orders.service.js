import { ordersRepository } from '../repositories/orders.repository.js';
import { createError } from '../utils/errors/index.js';

/**
 * Service de Pedidos (lectura).
 * Los pedidos se crean vía el módulo de mocks; acá exponemos la consulta,
 * aplicando la regla de "no encontrado" del dominio.
 */
export const ordersService = {
  getOrders: async () => {
    return ordersRepository.getAll();
  },

  getOrderById: async (id) => {
    const order = await ordersRepository.getById(id);
    if (!order) {
      throw createError('ORDER_NOT_FOUND');
    }
    return order;
  }
};
