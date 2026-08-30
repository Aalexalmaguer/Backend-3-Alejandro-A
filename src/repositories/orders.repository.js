import { OrderModel } from '../models/order.model.js';

/**
 * Repository de Pedidos. Única capa que conoce Mongoose para la entidad Order.
 */
const DEFAULT_PROJECTION = { __v: 0 };

export const ordersRepository = {
  getAll: async (filter = {}) => {
    return OrderModel.find(filter, DEFAULT_PROJECTION).lean();
  },

  // Consulta paginada (evita traer la colección completa sin control).
  paginate: async (filter = {}, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      OrderModel.find(filter, DEFAULT_PROJECTION).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      OrderModel.countDocuments(filter)
    ]);
    return { docs, total, page, limit };
  },

  getById: async (id) => {
    return OrderModel.findById(id, DEFAULT_PROJECTION).lean();
  },

  create: async (orderData) => {
    const created = await OrderModel.create(orderData);
    const { __v, ...order } = created.toObject();
    return order;
  },

  update: async (id, changes) => {
    return OrderModel.findByIdAndUpdate(id, changes, {
      new: true,
      runValidators: true,
      projection: DEFAULT_PROJECTION
    }).lean();
  },

  // Agrega los metadatos de un comprobante al pedido (M7).
  addReceipt: async (id, metadata) => {
    return OrderModel.findByIdAndUpdate(
      id,
      { $push: { receipts: metadata } },
      { new: true, runValidators: true, projection: DEFAULT_PROJECTION }
    ).lean();
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
