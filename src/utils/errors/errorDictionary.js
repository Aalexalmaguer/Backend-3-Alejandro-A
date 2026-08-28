/**
 * Diccionario centralizado de errores del dominio de ShipNow.
 *
 * Cada entrada define un caso de error con:
 *  - code:    identificador estable y legible (para el cliente y los logs)
 *  - status:  código HTTP con el que responde el middleware global
 *  - message: mensaje por defecto (puede sobreescribirse al crear el error)
 *
 * Tener los errores en un solo lugar evita mensajes/estados inconsistentes
 * repartidos por el código y hace que toda la API "hable el mismo idioma".
 */
export const ERRORS = Object.freeze({
  // Genéricos
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 400,
    message: 'Los datos enviados no son válidos'
  },
  INVALID_ID: {
    code: 'INVALID_ID',
    status: 400,
    message: 'El identificador proporcionado no es válido'
  },
  ROUTE_NOT_FOUND: {
    code: 'ROUTE_NOT_FOUND',
    status: 404,
    message: 'La ruta solicitada no existe'
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
    message: 'Ocurrió un error interno en el servidor'
  },

  // Usuarios
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    status: 404,
    message: 'Usuario no encontrado'
  },
  INVALID_ROLE: {
    code: 'INVALID_ROLE',
    status: 400,
    message: 'El rol indicado no es válido'
  },
  DUPLICATE_EMAIL: {
    code: 'DUPLICATE_EMAIL',
    status: 409,
    message: 'Ya existe un usuario con ese email'
  },

  // Productos
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    status: 404,
    message: 'Producto no encontrado'
  },
  INVALID_PRODUCT_DATA: {
    code: 'INVALID_PRODUCT_DATA',
    status: 400,
    message: 'Los datos del producto no son válidos'
  },

  // Pedidos / Entregas
  ORDER_NOT_FOUND: {
    code: 'ORDER_NOT_FOUND',
    status: 404,
    message: 'Pedido no encontrado'
  },
  DELIVERY_NOT_FOUND: {
    code: 'DELIVERY_NOT_FOUND',
    status: 404,
    message: 'Entrega no encontrada'
  },

  // Mocking
  INVALID_MOCK_QUANTITY: {
    code: 'INVALID_MOCK_QUANTITY',
    status: 400,
    message: 'La cantidad de datos de prueba solicitada no es válida'
  },
  INVALID_COLLECTION: {
    code: 'INVALID_COLLECTION',
    status: 400,
    message: 'La colección solicitada no es válida'
  },
  MOCK_LOAD_FAILED: {
    code: 'MOCK_LOAD_FAILED',
    status: 500,
    message: 'No se pudieron cargar los datos de prueba en la base'
  }
});
