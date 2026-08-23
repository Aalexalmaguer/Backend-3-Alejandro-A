import { OrderModel } from '../models/order.model.js';

/**
 * Repository de Pedidos. Única capa que conoce Mongoose para la entidad Order.
 */
const DEFAULT_PROJECTION = { __v: 0 };

export const ordersRepository = {
  getAll: async (filter = {}) => {
    return OrderModel.find(filter, DEFAULT_PROJECTION).lean();
  },

  getById: async (id) => {
    return OrderModel.findById(id, DEFAULT_PROJECTION).lean();
  },

  create: async (orderData) => {
    const created = await OrderModel.create(orderData);
    const { __v, ...order } = created.toObject();
    return order;
  },

  // Inserción masiva para la carga de datos de prueba (mocking).
  insertMany: async (docs) => {
    const created = await OrderModel.insertMany(docs);
    return created.map((doc) => {
      const { __v, ...order } = doc.toObject();
      return order;
    });
  }
};
