import { productsRepository } from '../repositories/products.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { createError } from '../utils/errors/index.js';

/**
 * Service de Productos: concentra la LÓGICA DE NEGOCIO.
 * No conoce Express (no recibe req/res) ni Mongoose (habla con el Repository).
 * Acá viven las reglas del dominio: derivar el estado según el stock, validar
 * datos y decidir qué productos están listos para enviarse.
 */

// Regla de negocio: un producto está disponible solo si tiene stock.
const resolveStatus = (stock) =>
  stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

export const productsService = {
  getProducts: async () => {
    return productsRepository.getAll();
  },

  // Regla de negocio: solo se pueden enviar productos con stock disponible.
  getAvailableProducts: async () => {
    return productsRepository.getAll({ status: PRODUCT_STATUS.AVAILABLE });
  },

  getProductById: async (id) => {
    const product = await productsRepository.getById(id);
    if (!product) {
      throw createError('PRODUCT_NOT_FOUND');
    }
    return product;
  },

  createProduct: async (data) => {
    const { name, price, stock = 0 } = data;

    if (!name || price === undefined) {
      throw createError('INVALID_PRODUCT_DATA', 'El producto requiere al menos "name" y "price"');
    }
    if (price < 0 || stock < 0) {
      throw createError('INVALID_PRODUCT_DATA', 'El precio y el stock no pueden ser negativos');
    }

    // El estado no lo decide el cliente: lo deriva el negocio a partir del stock.
    const product = {
      ...data,
      status: resolveStatus(stock)
    };

    return productsRepository.create(product);
  },

  updateStock: async (id, stock) => {
    if (stock === undefined || stock < 0) {
      throw createError('INVALID_PRODUCT_DATA', 'El stock debe ser un número mayor o igual a 0');
    }
    await productsService.getProductById(id); // valida existencia (404 si no existe)

    // Al actualizar el stock, recalculamos el estado según la regla de negocio.
    return productsRepository.update(id, {
      stock,
      status: resolveStatus(stock)
    });
  },

  deleteProduct: async (id) => {
    await productsService.getProductById(id); // valida existencia
    return productsRepository.delete(id);
  }
};
