import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { config } from './index.js';
import { DOCUMENT_TYPES } from '../constants/index.js';
import { createError } from '../utils/errors/index.js';
import { logger } from './logger.js';

/**
 * Configuración CENTRALIZADA de Multer (separada de los routers).
 * Define en un solo lugar:
 *  - dónde se guardan los archivos (carpeta base + subcarpetas por tipo),
 *  - cómo se nombran (nombre único, conservando la extensión original),
 *  - qué tipos se aceptan (fileFilter),
 *  - el tamaño máximo (limits),
 *  - y el mapeo de errores de carga al sistema de errores del proyecto.
 */

// Carpeta base de subidas. En testing usa una carpeta aparte y descartable.
const BASE_DIR = path.resolve(config.nodeEnv === 'test' ? 'uploads-test' : 'uploads');

// Subcarpetas por tipo de archivo.
export const UPLOAD_SUBDIRS = Object.freeze({
  USER_DOCUMENTS: 'user-documents',
  LICENSES: 'licenses',
  DELIVERY_PROOFS: 'delivery-proofs'
});

// Tipos MIME permitidos (documentos e imágenes de comprobante).
export const ALLOWED_MIME_TYPES = Object.freeze([
  'application/pdf',
  'image/jpeg',
  'image/png'
]);

// Tamaño máximo por archivo: 5 MB.
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadsBaseDir = () => BASE_DIR;

// Mapea un tipo de documento a su subcarpeta.
export const subdirForDocumentType = (documentType) => {
  if (documentType === DOCUMENT_TYPES.DRIVER_LICENSE) return UPLOAD_SUBDIRS.LICENSES;
  if (documentType === DOCUMENT_TYPES.DELIVERY_PROOF) return UPLOAD_SUBDIRS.DELIVERY_PROOFS;
  return UPLOAD_SUBDIRS.USER_DOCUMENTS;
};

// Crea el storage de Multer. `subdir` puede ser un string fijo o una función
// que resuelve la subcarpeta a partir del request (ej. según documentType).
const buildStorage = (subdir) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const sub = typeof subdir === 'function' ? subdir(req) : subdir;
      const dir = path.join(BASE_DIR, sub);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      cb(null, unique);
    }
  });
};

// fileFilter: solo acepta los tipos permitidos.
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warning(`Intento de subir un tipo no permitido: ${file.mimetype}`);
    // Se marca el error para mapearlo luego a INVALID_FILE_TYPE.
    cb(createError('INVALID_FILE_TYPE', `Tipo no permitido: ${file.mimetype}`));
  }
};

// Traduce los errores de Multer al sistema de errores centralizado.
const mapUploadError = (err) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return createError('FILE_TOO_LARGE', `Máximo permitido: ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
  }
  if (err?.name === 'AppError') return err; // ya viene mapeado (ej. INVALID_FILE_TYPE)
  return createError('UPLOAD_ERROR', err?.message);
};

/**
 * Devuelve un middleware que sube UN archivo (campo "file") a la subcarpeta
 * indicada, con validación de tipo/tamaño y errores ya traducidos.
 */
export const uploadSingle = (subdir, field = 'file') => {
  const uploader = multer({
    storage: buildStorage(subdir),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
  }).single(field);

  return (req, res, next) => {
    uploader(req, res, (err) => {
      if (err) return next(mapUploadError(err));
      next();
    });
  };
};
