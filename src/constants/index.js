/**
 * Constantes del dominio de ShipNow.
 *
 * Centralizamos acá los valores fijos del negocio para eliminar los
 * "strings mágicos" repartidos por el código. Usamos Object.freeze para que
 * sean inmutables: nadie puede reasignar USER_ROLES.ADMIN por accidente.
 *
 * El módulo de mocking (M2) reutiliza estas mismas constantes para generar
 * datos de prueba coherentes (roles, estados y prioridades válidos).
 */

// Roles de usuario. Se usan SIEMPRE vía este objeto, nunca como string suelto.
// USER = cliente/comprador; DRIVER = repartidor; STORE = comercio.
export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
  DRIVER: 'driver',
  STORE: 'store'
});

// Estados posibles de un producto según su disponibilidad de stock.
export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock'
});

// Estados por los que pasa un pedido en el flujo de logística.
export const ORDER_STATUS = Object.freeze({
  CREATED: 'created',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
});

// Estados de una entrega (delivery) asignada a un repartidor.
export const DELIVERY_STATUS = Object.freeze({
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered'
});

// Prioridad de una entrega.
export const DELIVERY_PRIORITY = Object.freeze({
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high'
});

// Tipos de documento que se pueden adjuntar a las entidades.
export const DOCUMENT_TYPES = Object.freeze({
  USER_DOCUMENT: 'user_document',
  DRIVER_LICENSE: 'driver_license',
  DELIVERY_PROOF: 'delivery_proof'
});

// Listas derivadas, útiles para validaciones y para los enums de Mongoose.
export const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));
export const PRODUCT_STATUS_VALUES = Object.freeze(Object.values(PRODUCT_STATUS));
export const ORDER_STATUS_VALUES = Object.freeze(Object.values(ORDER_STATUS));
export const DELIVERY_STATUS_VALUES = Object.freeze(Object.values(DELIVERY_STATUS));
export const DELIVERY_PRIORITY_VALUES = Object.freeze(Object.values(DELIVERY_PRIORITY));
export const DOCUMENT_TYPE_VALUES = Object.freeze(Object.values(DOCUMENT_TYPES));
