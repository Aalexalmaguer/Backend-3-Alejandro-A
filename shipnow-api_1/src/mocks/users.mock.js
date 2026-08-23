import { USER_ROLES } from '../constants/index.js';
import { randomFrom, nextSeq } from './helpers.js';

/**
 * Generadores de usuarios/repartidores de prueba.
 * Los datos respetan la estructura del modelo User y usan SIEMPRE los roles
 * definidos en las constantes (nunca strings sueltos).
 */
const FIRST_NAMES = [
  'Camila', 'Martina', 'Diego', 'Lucas', 'Valentina', 'Mateo',
  'Sofía', 'Benjamín', 'Emma', 'Thiago', 'Alejandro', 'Ana'
];
const LAST_NAMES = [
  'Gómez', 'Pérez', 'Torres', 'López', 'Fernández', 'Ramírez',
  'Díaz', 'Sánchez', 'Romero', 'Álvarez', 'Almaguer', 'Ruiz'
];

const MOCK_PASSWORD = 'coder123';

// Genera un usuario con un rol dado (por defecto, cliente = USER).
export const generateMockUser = (role = USER_ROLES.USER) => {
  const firstName = randomFrom(FIRST_NAMES);
  const lastName = randomFrom(LAST_NAMES);
  const seq = nextSeq();
  return {
    firstName,
    lastName,
    email: `${firstName}.${lastName}.${seq}@test.com`.toLowerCase(),
    password: MOCK_PASSWORD,
    role
  };
};

// Genera un repartidor: usuario con rol DRIVER y disponibilidad.
export const generateMockDriver = () => ({
  ...generateMockUser(USER_ROLES.DRIVER),
  isAvailable: true
});

// Genera N usuarios de un rol.
export const generateMockUsers = (qty, role = USER_ROLES.USER) =>
  Array.from({ length: qty }, () => generateMockUser(role));

// Genera N repartidores.
export const generateMockDrivers = (qty) =>
  Array.from({ length: qty }, () => generateMockDriver());
