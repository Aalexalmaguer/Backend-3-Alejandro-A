import { DeliveryModel } from '../models/delivery.model.js';

/**
 * Repository de Entregas. Única capa que conoce Mongoose para la entidad Delivery.
 */
const DEFAULT_PROJECTION = { __v: 0 };

export const deliveriesRepository = {
  getAll: async (filter = {}) => {
    return DeliveryModel.find(filter, DEFAULT_PROJECTION).lean();
  },

  getById: async (id) => {
    return DeliveryModel.findById(id, DEFAULT_PROJECTION).lean();
  },

  create: async (deliveryData) => {
    const created = await DeliveryModel.create(deliveryData);
    const { __v, ...delivery } = created.toObject();
    return delivery;
  },

  // Inserción masiva para la carga de datos de prueba (mocking).
  insertMany: async (docs) => {
    const created = await DeliveryModel.insertMany(docs);
    return created.map((doc) => {
      const { __v, ...delivery } = doc.toObject();
      return delivery;
    });
  }
};
