import {
  USER_ROLE_VALUES,
  PRODUCT_STATUS_VALUES,
  ORDER_STATUS_VALUES,
  DELIVERY_STATUS_VALUES,
  DELIVERY_PRIORITY_VALUES
} from '../constants/index.js';

/**
 * Schemas reutilizables de OpenAPI.
 * Los enums se toman de las constantes del dominio, así la documentación queda
 * SIEMPRE sincronizada con el comportamiento real de la API.
 */
export const schemas = {
  User: {
    type: 'object',
    description: 'Usuario de ShipNow (el password nunca se expone en las respuestas).',
    properties: {
      _id: { type: 'string', example: '66b0f2a1c1a2b3c4d5e6f7a8' },
      firstName: { type: 'string', example: 'Ana' },
      lastName: { type: 'string', example: 'López' },
      email: { type: 'string', format: 'email', example: 'ana.lopez@test.com' },
      role: { type: 'string', enum: USER_ROLE_VALUES, example: 'user' },
      isAvailable: {
        type: 'boolean',
        description: 'Solo aplica a repartidores (role = driver).',
        example: true
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },

  UserInput: {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'password'],
    properties: {
      firstName: { type: 'string', example: 'Ana' },
      lastName: { type: 'string', example: 'López' },
      email: { type: 'string', format: 'email', example: 'ana.lopez@test.com' },
      password: { type: 'string', example: 'coder123' },
      role: {
        type: 'string',
        enum: USER_ROLE_VALUES,
        description: 'Opcional. Por defecto "user".',
        example: 'user'
      }
    }
  },

  Product: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '66b0f2a1c1a2b3c4d5e6f7a9' },
      name: { type: 'string', example: 'Caja mediana' },
      description: { type: 'string', example: 'Caja de cartón reforzada' },
      price: { type: 'number', example: 1500 },
      stock: { type: 'integer', example: 10 },
      status: {
        type: 'string',
        enum: PRODUCT_STATUS_VALUES,
        description: 'Derivado del stock por el negocio (no lo envía el cliente).',
        example: 'available'
      }
    }
  },

  ProductInput: {
    type: 'object',
    required: ['name', 'price'],
    properties: {
      name: { type: 'string', example: 'Caja mediana' },
      description: { type: 'string', example: 'Caja de cartón reforzada' },
      price: { type: 'number', example: 1500 },
      stock: { type: 'integer', example: 10 }
    }
  },

  OrderItem: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Caja mediana' },
      quantity: { type: 'integer', example: 2 },
      price: { type: 'number', example: 1500 }
    }
  },

  Order: {
    type: 'object',
    description: 'Pedido. Se relaciona con un usuario (customer).',
    properties: {
      _id: { type: 'string', example: '66b0f2a1c1a2b3c4d5e6f7aa' },
      customer: {
        type: 'string',
        description: 'Id del usuario dueño del pedido (relación pedido ↔ usuario).',
        example: '66b0f2a1c1a2b3c4d5e6f7a8'
      },
      items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
      deliveryAddress: { type: 'string', example: 'Av. Reforma 500' },
      total: { type: 'number', example: 3000 },
      status: { type: 'string', enum: ORDER_STATUS_VALUES, example: 'created' },
      priority: { type: 'string', enum: DELIVERY_PRIORITY_VALUES, example: 'normal' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },

  Delivery: {
    type: 'object',
    description: 'Entrega. Relaciona un pedido con un repartidor (driver).',
    properties: {
      _id: { type: 'string', example: '66b0f2a1c1a2b3c4d5e6f7ab' },
      order: {
        type: 'string',
        description: 'Id del pedido (relación entrega ↔ pedido).',
        example: '66b0f2a1c1a2b3c4d5e6f7aa'
      },
      driver: {
        type: 'string',
        description: 'Id del repartidor (usuario con rol driver).',
        example: '66b0f2a1c1a2b3c4d5e6f7ac'
      },
      status: { type: 'string', enum: DELIVERY_STATUS_VALUES, example: 'pending' },
      priority: { type: 'string', enum: DELIVERY_PRIORITY_VALUES, example: 'normal' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },

  // Envoltorio genérico de respuesta exitosa: { status: 'success', payload: ... }
  SuccessResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      payload: { type: 'object' }
    }
  },

  // Estructura uniforme de error del proyecto (M3).
  ErrorResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'USER_NOT_FOUND' },
          message: { type: 'string', example: 'Usuario no encontrado' }
        }
      }
    }
  }
};
