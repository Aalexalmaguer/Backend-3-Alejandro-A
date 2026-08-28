/**
 * Respuestas de error reutilizables (components.responses).
 * Coinciden con los errores reales del diccionario del M3: mismo formato,
 * mismos códigos y mismos status HTTP.
 */
const errorExample = (code, message) => ({
  description: message,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: { status: 'error', error: { code, message } }
    }
  }
});

export const responses = {
  ValidationError: errorExample('VALIDATION_ERROR', 'Los datos enviados no son válidos'),
  InvalidId: errorExample('INVALID_ID', 'El identificador proporcionado no es válido'),
  InvalidRole: errorExample('INVALID_ROLE', 'El rol indicado no es válido'),
  InvalidProductData: errorExample('INVALID_PRODUCT_DATA', 'Los datos del producto no son válidos'),
  InvalidMockQuantity: errorExample('INVALID_MOCK_QUANTITY', 'La cantidad de datos de prueba solicitada no es válida'),
  InvalidCollection: errorExample('INVALID_COLLECTION', 'La colección solicitada no es válida'),
  UserNotFound: errorExample('USER_NOT_FOUND', 'Usuario no encontrado'),
  ProductNotFound: errorExample('PRODUCT_NOT_FOUND', 'Producto no encontrado'),
  OrderNotFound: errorExample('ORDER_NOT_FOUND', 'Pedido no encontrado'),
  InvalidOrderStatus: errorExample('INVALID_ORDER_STATUS', 'El estado del pedido no es válido'),
  DeliveryNotFound: errorExample('DELIVERY_NOT_FOUND', 'Entrega no encontrada'),
  RouteNotFound: errorExample('ROUTE_NOT_FOUND', 'La ruta solicitada no existe'),
  DuplicateEmail: errorExample('DUPLICATE_EMAIL', 'Ya existe un usuario con ese email'),
  MockLoadFailed: errorExample('MOCK_LOAD_FAILED', 'No se pudieron cargar los datos de prueba en la base'),
  FileRequired: errorExample('FILE_REQUIRED', 'Se requiere un archivo en el campo "file"'),
  InvalidFileType: errorExample('INVALID_FILE_TYPE', 'El tipo de archivo no está permitido'),
  FileTooLarge: errorExample('FILE_TOO_LARGE', 'El archivo supera el tamaño máximo permitido'),
  InvalidDocumentType: errorExample('INVALID_DOCUMENT_TYPE', 'El tipo de documento no es válido'),
  InternalError: errorExample('INTERNAL_SERVER_ERROR', 'Ocurrió un error interno en el servidor')
};
