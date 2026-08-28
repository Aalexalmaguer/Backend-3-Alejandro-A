import { usersService } from '../services/users.service.js';
import { ordersService } from '../services/orders.service.js';
import { deliveriesService } from '../services/deliveries.service.js';

/**
 * Middlewares que validan la existencia de la entidad ANTES de subir el archivo.
 * Así, si la entidad no existe, Multer nunca llega a guardar el archivo en disco.
 * Cada uno deriva el error (404) al middleware global si la entidad no existe.
 */
export const ensureUserExists = async (req, res, next) => {
  try {
    await usersService.getUserById(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
};

export const ensureOrderExists = async (req, res, next) => {
  try {
    await ordersService.getOrderById(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
};

export const ensureDeliveryExists = async (req, res, next) => {
  try {
    await deliveriesService.getDeliveryById(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
};
