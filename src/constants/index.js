/**
 * Constantes del dominio de ShipNow.
 *
 * Centralizamos acá los valores fijos del negocio para eliminar los
 * "strings mágicos" repartidos por el código. Usamos Object.freeze para que
 * sean inmutables: nadie puede reasignar USER_ROLES.ADMIN por accidente.
 */

// Roles de usuario. Se usan SIEMPRE vía este objeto, nunca como string suelto.
export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user'
});

// Estados posibles de un producto según su disponibilidad de stock.
export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock'
});

// Listas derivadas, útiles para validaciones y para los enums de Mongoose.
export const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));
export const PRODUCT_STATUS_VALUES = Object.freeze(Object.values(PRODUCT_STATUS));
