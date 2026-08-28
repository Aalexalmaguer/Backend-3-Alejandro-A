import mongoose from 'mongoose';
import { USER_ROLES, USER_ROLE_VALUES } from '../constants/index.js';
import { fileMetadataSchema } from './fileMetadata.schema.js';

/**
 * Modelo de Usuario.
 * El modelo SOLO define la estructura del documento en MongoDB.
 * El rol se restringe a los valores válidos definidos en las constantes.
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.USER
    },
    // Solo aplica a repartidores (role = driver): indica si puede tomar entregas.
    isAvailable: {
      type: Boolean
    },
    // Metadatos de los documentos adjuntos del usuario (M7).
    documents: {
      type: [fileMetadataSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model('User', userSchema);
