import mongoose from 'mongoose';
import {
  DELIVERY_STATUS,
  DELIVERY_STATUS_VALUES,
  DELIVERY_PRIORITY,
  DELIVERY_PRIORITY_VALUES
} from '../constants/index.js';
import { fileMetadataSchema } from './fileMetadata.schema.js';

/**
 * Modelo de Entrega (Delivery).
 * Relaciona un pedido (order) con un repartidor (driver, un User con rol driver).
 * Estados y prioridad se restringen a las constantes del dominio.
 */
const deliverySchema = new mongoose.Schema(
  {
    // Relación entrega ↔ pedido
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    // Relación entrega ↔ repartidor (opcional hasta que se asigne)
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: DELIVERY_STATUS_VALUES,
      default: DELIVERY_STATUS.PENDING
    },
    priority: {
      type: String,
      enum: DELIVERY_PRIORITY_VALUES,
      default: DELIVERY_PRIORITY.NORMAL
    },
    // Metadatos de comprobantes asociados a la entrega (M7).
    receipts: {
      type: [fileMetadataSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const DeliveryModel = mongoose.model('Delivery', deliverySchema);
