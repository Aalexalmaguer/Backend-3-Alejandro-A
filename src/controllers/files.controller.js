import { filesService } from '../services/files.service.js';

/**
 * Controller de carga de archivos. Única puerta de entrada HTTP.
 * El archivo ya viene procesado por Multer en req.file; acá solo se delega
 * en el service y se arma la respuesta.
 */
export const filesController = {
  // POST /api/users/:id/documents  (multipart/form-data)
  uploadUserDocument: async (req, res, next) => {
    try {
      const { user, document } = await filesService.uploadUserDocument(
        req.params.id,
        req.file,
        req.body.documentType
      );
      res.status(201).json({
        status: 'success',
        message: 'Documento cargado y asociado al usuario',
        payload: { document, user }
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/:id/receipts  (multipart/form-data)
  uploadOrderReceipt: async (req, res, next) => {
    try {
      const { entity, receipt } = await filesService.uploadReceipt('order', req.params.id, req.file);
      res.status(201).json({
        status: 'success',
        message: 'Comprobante cargado y asociado al pedido',
        payload: { receipt, order: entity }
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/deliveries/:id/receipts  (multipart/form-data)
  uploadDeliveryReceipt: async (req, res, next) => {
    try {
      const { entity, receipt } = await filesService.uploadReceipt(
        'delivery',
        req.params.id,
        req.file
      );
      res.status(201).json({
        status: 'success',
        message: 'Comprobante cargado y asociado a la entrega',
        payload: { receipt, delivery: entity }
      });
    } catch (error) {
      next(error);
    }
  }
};
