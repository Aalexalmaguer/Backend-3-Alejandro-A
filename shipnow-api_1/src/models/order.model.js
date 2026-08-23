import mongoose from 'mongoose';
import {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  DELIVERY_PRIORITY,
  DELIVERY_PRIORITY_VALUES
} from '../constants/index.js';

/**
 * Modelo de Pedido (Order).
 * Solo define la estructura del documento. Un pedido pertenece a un usuario
 * (customer) y sus estados/prioridades se restringen a las constantes válidas.
 */
const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Relación pedido ↔ usuario
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [orderItemSchema],
      default: []
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.CREATED
    },
    priority: {
      type: String,
      enum: DELIVERY_PRIORITY_VALUES,
      default: DELIVERY_PRIORITY.NORMAL
    }
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model('Order', orderSchema);
