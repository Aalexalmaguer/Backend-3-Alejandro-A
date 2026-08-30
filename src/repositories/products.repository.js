import { ProductModel } from '../models/product.model.js';

/**
 * Repository de Productos.
 * ÚNICA capa que conoce Mongoose/MongoDB. Encapsula el acceso a datos:
 * define proyecciones por defecto (ocultamos __v) y expone una API de datos
 * estable para que el Service no dependa de detalles de persistencia.
 */

// Proyección por defecto: nunca devolvemos el campo interno __v.
const DEFAULT_PROJECTION = { __v: 0 };

export const productsRepository = {
  getAll: async (filter = {}) => {
    return ProductModel.find(filter, DEFAULT_PROJECTION).lean();
  },

  // Consulta paginada (evita traer la colección completa sin control).
  paginate: async (filter = {}, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ProductModel.find(filter, DEFAULT_PROJECTION).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(filter)
    ]);
    return { docs, total, page, limit };
  },

  getById: async (id) => {
    return ProductModel.findById(id, DEFAULT_PROJECTION).lean();
  },

  create: async (productData) => {
    const created = await ProductModel.create(productData);
    // Normalizamos la salida quitando __v para mantener consistencia.
    const { __v, ...product } = created.toObject();
    return product;
  },

  update: async (id, changes) => {
    return ProductModel.findByIdAndUpdate(id, changes, {
      new: true,
      runValidators: true,
      projection: DEFAULT_PROJECTION
    }).lean();
  },

  delete: async (id) => {
    return ProductModel.findByIdAndDelete(id, { projection: DEFAULT_PROJECTION }).lean();
  }
};
