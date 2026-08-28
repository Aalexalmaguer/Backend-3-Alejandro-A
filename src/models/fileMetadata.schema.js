import mongoose from 'mongoose';
import { DOCUMENT_TYPE_VALUES } from '../constants/index.js';

/**
 * Subschema de METADATOS de archivo.
 * En la base guardamos SOLO los metadatos, nunca el archivo en sí.
 */
export const fileMetadataSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true }, // nombre original del archivo
    filename: { type: String, required: true }, // nombre generado en el servidor
    path: { type: String, required: true }, // ruta donde quedó guardado
    mimetype: { type: String, required: true }, // tipo (application/pdf, image/png, ...)
    size: { type: Number, required: true }, // tamaño en bytes
    documentType: { type: String, enum: DOCUMENT_TYPE_VALUES, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);
