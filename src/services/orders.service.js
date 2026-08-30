import { ordersRepository } from '../repositories/orders.repository.js';
import { usersRepository } from '../repositories/users.repository.js';
import {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  DELIVERY_PRIORITY,
  DELIVERY_PRIORITY_VALUES
} from '../constants/index.js';
import { createError } from '../utils/errors/index.js';
import { buildPaginationMeta } from '../utils/pagination.js';
import { logger } from '../config/logger.js';

/**
 * Service de Pedidos: lógica de negocio de pedidos.
 * No conoce Express ni Mongoose. Valida la relación pedido ↔ usuario,
 * calcula el total y controla los estados válidos del dominio.
 */
export const ordersService = {
  getOrders: async ({ page, limit } = {}) => {
    const result = await ordersRepository.paginate({}, { page, limit });
    return { docs: result.docs, pagination: buildPaginationMeta(result) };
  },

  getOrderById: async (id) => {
    const order = await ordersRepository.getById(id);
    if (!order) {
      throw createError('ORDER_NOT_FOUND');
    }
    return order;
  },

  createOrder: async (data) => {
    const { customer, items, deliveryAddress, priority } = data;

    if (!customer || !deliveryAddress || !Array.isArray(items) || items.length === 0) {
      throw createError(
        'VALIDATION_ERROR',
        'El pedido requiere "customer", "deliveryAddress" e "items" (no vacío)'
      );
    }

    const itemsOk = items.every(
      (i) => i && i.name && Number(i.quantity) > 0 && Number(i.price) >= 0
    );
    if (!itemsOk) {
      throw createError(
        'VALIDATION_ERROR',
        'Cada item requiere "name", "quantity" (>0) y "price" (>=0)'
      );
    }

    // Regla de negocio: el pedido debe pertenecer a un usuario existente.
    const user = await usersRepository.getById(customer);
    if (!user) {
      throw createError('USER_NOT_FOUND', 'El usuario (customer) del pedido no existe');
    }

    // Prioridad válida (si se envía).
    const finalPriority = priority ?? DELIVERY_PRIORITY.NORMAL;
    if (!DELIVERY_PRIORITY_VALUES.includes(finalPriority)) {
      throw createError(
        'VALIDATION_ERROR',
        `Prioridad inválida. Permitidas: ${DELIVERY_PRIORITY_VALUES.join(', ')}`
      );
    }

    // Regla de negocio: el total lo calcula el servicio, no el cliente.
    const total = items.reduce((acc, i) => acc + i.quantity * i.price, 0);

    const created = await ordersRepository.create({
      customer,
      items,
      deliveryAddress,
      total,
      status: ORDER_STATUS.CREATED,
      priority: finalPriority
    });

    logger.info(`Pedido creado para el usuario ${customer} (total: ${total})`);
    return created;
  },

  updateStatus: async (id, status) => {
    // Regla de negocio: solo se aceptan estados válidos del dominio.
    if (!ORDER_STATUS_VALUES.includes(status)) {
      throw createError(
        'INVALID_ORDER_STATUS',
        `Estado inválido. Permitidos: ${ORDER_STATUS_VALUES.join(', ')}`
      );
    }
    await ordersService.getOrderById(id); // valida existencia (404 si no existe)
    return ordersRepository.update(id, { status });
  }
};
