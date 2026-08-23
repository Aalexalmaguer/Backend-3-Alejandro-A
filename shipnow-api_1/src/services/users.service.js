import { usersRepository } from '../repositories/users.repository.js';
import { USER_ROLES, USER_ROLE_VALUES } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Service de Usuarios: concentra la LÓGICA DE NEGOCIO.
 * No conoce Express ni Mongoose. Valida reglas del dominio: rol válido,
 * email único y campos obligatorios. Los roles se comparan SIEMPRE contra
 * las constantes, nunca contra strings sueltos.
 */
export const usersService = {
  getUsers: async () => {
    return usersRepository.getAll();
  },

  getUserById: async (id) => {
    const user = await usersRepository.getById(id);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return user;
  },

  createUser: async (data) => {
    const { firstName, lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
      throw new AppError(
        'El usuario requiere "firstName", "lastName", "email" y "password"',
        400
      );
    }

    // Regla de negocio: el rol, si se envía, debe ser uno de los válidos.
    const role = data.role ?? USER_ROLES.USER;
    if (!USER_ROLE_VALUES.includes(role)) {
      throw new AppError(
        `Rol inválido. Valores permitidos: ${USER_ROLE_VALUES.join(', ')}`,
        400
      );
    }

    // Regla de negocio: no puede haber dos usuarios con el mismo email.
    const existing = await usersRepository.getByEmail(email);
    if (existing) {
      throw new AppError('Ya existe un usuario con ese email', 409);
    }

    return usersRepository.create({ ...data, role });
  },

  deleteUser: async (id) => {
    await usersService.getUserById(id); // valida existencia (404 si no existe)
    return usersRepository.delete(id);
  }
};
