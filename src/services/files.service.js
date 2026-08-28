import fs from 'fs/promises';
import { usersRepository } from '../repositories/users.repository.js';
import { ordersRepository } from '../repositories/orders.repository.js';
import { deliveriesRepository } from '../repositories/deliveries.repository.js';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_VALUES } from '../constants/index.js';
import { createError } from '../utils/errors/index.js';
import { logger } from '../config/logger.js';

/**
 * Service de archivos: valida y registra los METADATOS de los archivos subidos.
 * No conoce Express ni Multer directamente; recibe el `file` ya procesado.
 * El archivo vive en disco; en la base solo guardamos sus metadatos.
 */

// Construye los metadatos que se guardan en la base (nunca el archivo).
const buildMetadata = (file, documentType) => ({
  originalName: file.originalname,
  filename: file.filename,
  path: file.path,
  mimetype: file.mimetype,
  size: file.size,
  documentType,
  uploadedAt: new Date()
});

// Si una validación falla DESPUÉS de guardar el archivo, lo borramos del disco.
const removeFile = async (file) => {
  if (file?.path) await fs.unlink(file.path).catch(() => {});
};

export const filesService = {
  /**
   * Registra un documento en un usuario.
   * La existencia del usuario se valida ANTES de subir el archivo (middleware),
   * pero acá se revalida por robustez.
   */
  uploadUserDocument: async (userId, file, documentType) => {
    if (!file) {
      throw createError('FILE_REQUIRED');
    }
    if (!DOCUMENT_TYPE_VALUES.includes(documentType)) {
      await removeFile(file);
      throw createError(
        'INVALID_DOCUMENT_TYPE',
        `Tipo de documento inválido. Permitidos: ${DOCUMENT_TYPE_VALUES.join(', ')}`
      );
    }

    const metadata = buildMetadata(file, documentType);

    let user;
    try {
      user = await usersRepository.addDocument(userId, metadata);
    } catch (err) {
      await removeFile(file);
      logger.error(`Error al guardar metadatos de documento: ${err.message}`);
      throw createError('FILE_SAVE_ERROR');
    }
    if (!user) {
      await removeFile(file);
      throw createError('USER_NOT_FOUND');
    }

    logger.info(`Documento cargado para usuario ${userId}: ${file.filename} (${documentType})`);
    return { user, document: metadata };
  },

  /**
   * Registra un comprobante en un pedido o una entrega.
   * kind: 'order' | 'delivery'.
   */
  uploadReceipt: async (kind, entityId, file) => {
    if (!file) {
      throw createError('FILE_REQUIRED');
    }

    const metadata = buildMetadata(file, DOCUMENT_TYPES.DELIVERY_PROOF);
    const repo = kind === 'order' ? ordersRepository : deliveriesRepository;
    const notFoundCode = kind === 'order' ? 'ORDER_NOT_FOUND' : 'DELIVERY_NOT_FOUND';

    let entity;
    try {
      entity = await repo.addReceipt(entityId, metadata);
    } catch (err) {
      await removeFile(file);
      logger.error(`Error al guardar metadatos de comprobante: ${err.message}`);
      throw createError('FILE_SAVE_ERROR');
    }
    if (!entity) {
      await removeFile(file);
      throw createError(notFoundCode);
    }

    logger.info(`Comprobante asociado a ${kind} ${entityId}: ${file.filename}`);
    return { entity, receipt: metadata };
  }
};
