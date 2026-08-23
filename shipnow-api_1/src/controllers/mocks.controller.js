import { mocksService } from '../services/mocks.service.js';

/**
 * Controller de Mocking: única puerta de entrada HTTP.
 * Lee query/body, delega en el Service y responde. No genera datos ni conoce
 * Mongoose: toda la lógica vive en el Service y en src/mocks/.
 */
export const mocksController = {
  // GET /api/mocks/:collection?qty=N  → datos simulados SIN guardar
  preview: (req, res, next) => {
    try {
      const data = mocksService.preview(req.params.collection, req.query.qty);
      res.status(200).json({ status: 'success', payload: data });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/mocks/seed?qty=N&collection=users  → inserta en MongoDB
  seed: async (req, res, next) => {
    try {
      const collection = req.query.collection || req.body?.collection || 'users';
      const qty = req.query.qty ?? req.body?.qty;
      const result = await mocksService.seed(collection, qty);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/mocks/generateData  → carga relacional completa
  generateData: async (req, res, next) => {
    try {
      const result = await mocksService.generateData(req.body || {});
      res.status(201).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
};
