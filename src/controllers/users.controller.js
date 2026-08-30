import { usersService } from '../services/users.service.js';
import { resolvePageQuery } from '../utils/pagination.js';

/**
 * Controller de Usuarios: única puerta de entrada HTTP.
 * Lee req, delega en el Service y arma la respuesta con el status apropiado.
 * No conoce detalles de la base de datos ni reglas del negocio.
 */
export const usersController = {
  getUsers: async (req, res, next) => {
    try {
      const { page, limit } = resolvePageQuery(req.query);
      const { docs, pagination } = await usersService.getUsers({ page, limit });
      res.status(200).json({ status: 'success', payload: docs, pagination });
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const user = await usersService.getUserById(req.params.id);
      res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const user = await usersService.createUser(req.body);
      res.status(201).json({ status: 'success', payload: user });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      await usersService.deleteUser(req.params.id);
      res.status(200).json({ status: 'success', message: 'Usuario eliminado' });
    } catch (error) {
      next(error);
    }
  }
};
