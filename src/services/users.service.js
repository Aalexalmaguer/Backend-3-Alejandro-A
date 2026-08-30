import { usersRepository } from '../repositories/users.repository.js';
import { USER_ROLES, USER_ROLE_VALUES } from '../constants/index.js';
import { createError } from '../utils/errors/index.js';
import { buildPaginationMeta } from '../utils/pagination.js';
import { logger } from '../config/logger.js';

/**
 * Service de Usuarios: concentra la LÓGICA DE NEGOCIO.
 * No conoce Express ni Mongoose. Valida reglas del dominio: rol válido,
 * email único y campos obligatorios. Los roles se comparan SIEMPRE contra
 * las constantes, nunca contra strings sueltos.
 */
export const usersService = {
  getUsers: async ({ page, limit } = {}) => {
    const result = await usersRepository.paginate({}, { page, limit });
    return { docs: result.docs, pagination: buildPaginationMeta(result) };
  },

  getUserById: async (id) => {
    const user = await usersRepository.getById(id);
    if (!user) {
      throw createError('USER_NOT_FOUND');
    }
    return user;
  },

  createUser: async (data) => {
    const { firstName, lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
      throw createError(
        'VALIDATION_ERROR',
        'El usuario requiere "firstName", "lastName", "email" y "password"'
      );
    }

    // Regla de negocio: el rol, si se envía, debe ser uno de los válidos.
    const role = data.role ?? USER_ROLES.USER;
    if (!USER_ROLE_VALUES.includes(role)) {
      throw createError(
        'INVALID_ROLE',
        `Rol inválido. Valores permitidos: ${USER_ROLE_VALUES.join(', ')}`
      );
    }

    // Regla de negocio: no puede haber dos usuarios con el mismo email.
    const existing = await usersRepository.getByEmail(email);
    if (existing) {
      throw createError('DUPLICATE_EMAIL');
    }

    const created = await usersRepository.create({ ...data, role });
    logger.info(`Usuario creado: ${created.email} (rol: ${created.role})`);
    return created;
  },

  deleteUser: async (id) => {
    await usersService.getUserById(id); // valida existencia (404 si no existe)
    return usersRepository.delete(id);
  }
};
