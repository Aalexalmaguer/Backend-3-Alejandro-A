import mongoose from 'mongoose';
import { PRODUCT_STATUS, PRODUCT_STATUS_VALUES } from '../constants/index.js';

/**
 * Modelo de Producto.
 * El modelo SOLO define la estructura del documento en MongoDB.
 * No contiene lógica de negocio ni de controladores.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: PRODUCT_STATUS_VALUES,
      default: PRODUCT_STATUS.OUT_OF_STOCK
    }
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model('Product', productSchema);
