/**
 * Definición de los endpoints (paths) de OpenAPI, agrupados por tags.
 * Se mantiene separada de los routers: acá SOLO se documenta, no hay lógica.
 */

// Respuesta exitosa con envoltorio { status: 'success', payload }.
const ok = (description, schemaRef, isArray = false) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          payload: isArray
            ? { type: 'array', items: { $ref: schemaRef } }
            : { $ref: schemaRef }
        }
      }
    }
  }
});

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Identificador (ObjectId de MongoDB).',
  schema: { type: 'string' }
};

const err = (ref) => ({ $ref: `#/components/responses/${ref}` });

export const paths = {
  // ---------------- USERS ----------------
  '/api/users': {
    get: {
      tags: ['Users'],
      summary: 'Lista todos los usuarios',
      description: 'Devuelve todos los usuarios. El password nunca se incluye.',
      responses: {
        200: ok('Lista de usuarios', '#/components/schemas/User', true)
      }
    },
    post: {
      tags: ['Users'],
      summary: 'Crea un usuario',
      description: 'Valida campos obligatorios, rol permitido y email único.',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/UserInput' } }
        }
      },
      responses: {
        201: ok('Usuario creado', '#/components/schemas/User'),
        400: err('ValidationError'),
        409: err('DuplicateEmail')
      }
    }
  },
  '/api/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Obtiene un usuario por id',
      parameters: [idParam],
      responses: {
        200: ok('Usuario encontrado', '#/components/schemas/User'),
        400: err('InvalidId'),
        404: err('UserNotFound')
      }
    },
    delete: {
      tags: ['Users'],
      summary: 'Elimina un usuario',
      parameters: [idParam],
      responses: {
        200: ok('Usuario eliminado', '#/components/schemas/SuccessResponse'),
        400: err('InvalidId'),
        404: err('UserNotFound')
      }
    }
  },

  // ---------------- PRODUCTS ----------------
  '/api/products': {
    get: {
      tags: ['Products'],
      summary: 'Lista productos',
      description: 'Con ?available=true devuelve solo los productos con stock disponible.',
      parameters: [
        {
          name: 'available',
          in: 'query',
          required: false,
          description: 'Si es "true", filtra solo productos disponibles.',
          schema: { type: 'string', enum: ['true'] }
        }
      ],
      responses: { 200: ok('Lista de productos', '#/components/schemas/Product', true) }
    },
    post: {
      tags: ['Products'],
      summary: 'Crea un producto',
      description: 'El estado se deriva del stock (no lo envía el cliente).',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } }
        }
      },
      responses: {
        201: ok('Producto creado', '#/components/schemas/Product'),
        400: err('InvalidProductData')
      }
    }
  },
  '/api/products/{id}': {
    get: {
      tags: ['Products'],
      summary: 'Obtiene un producto por id',
      parameters: [idParam],
      responses: {
        200: ok('Producto encontrado', '#/components/schemas/Product'),
        400: err('InvalidId'),
        404: err('ProductNotFound')
      }
    },
    delete: {
      tags: ['Products'],
      summary: 'Elimina un producto',
      parameters: [idParam],
      responses: {
        200: ok('Producto eliminado', '#/components/schemas/SuccessResponse'),
        400: err('InvalidId'),
        404: err('ProductNotFound')
      }
    }
  },
  '/api/products/{id}/stock': {
    patch: {
      tags: ['Products'],
      summary: 'Actualiza el stock de un producto',
      description: 'Recalcula el estado (available / out_of_stock) según el nuevo stock.',
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['stock'],
              properties: { stock: { type: 'integer', example: 5 } }
            }
          }
        }
      },
      responses: {
        200: ok('Stock actualizado', '#/components/schemas/Product'),
        400: err('InvalidProductData'),
        404: err('ProductNotFound')
      }
    }
  },

  // ---------------- ORDERS ----------------
  '/api/orders': {
    get: {
      tags: ['Orders'],
      summary: 'Lista los pedidos',
      description: 'Los pedidos se generan con el módulo de mocks.',
      responses: { 200: ok('Lista de pedidos', '#/components/schemas/Order', true) }
    }
  },
  '/api/orders/{id}': {
    get: {
      tags: ['Orders'],
      summary: 'Obtiene un pedido por id',
      parameters: [idParam],
      responses: {
        200: ok('Pedido encontrado', '#/components/schemas/Order'),
        400: err('InvalidId'),
        404: err('OrderNotFound')
      }
    }
  },

  // ---------------- DELIVERIES ----------------
  '/api/deliveries': {
    get: {
      tags: ['Deliveries'],
      summary: 'Lista las entregas',
      description: 'Las entregas se generan con el módulo de mocks.',
      responses: { 200: ok('Lista de entregas', '#/components/schemas/Delivery', true) }
    }
  },
  '/api/deliveries/{id}': {
    get: {
      tags: ['Deliveries'],
      summary: 'Obtiene una entrega por id',
      parameters: [idParam],
      responses: {
        200: ok('Entrega encontrada', '#/components/schemas/Delivery'),
        400: err('InvalidId'),
        404: err('DeliveryNotFound')
      }
    }
  },

  // ---------------- MOCKS ----------------
  '/api/mocks/{collection}': {
    get: {
      tags: ['Mocks'],
      summary: 'Datos simulados SIN guardar',
      description: 'Genera y devuelve datos de prueba sin insertarlos en la base.',
      parameters: [
        {
          name: 'collection',
          in: 'path',
          required: true,
          description: 'Colección a simular.',
          schema: { type: 'string', enum: ['users', 'drivers', 'orders', 'deliveries'] }
        },
        {
          name: 'qty',
          in: 'query',
          required: false,
          description: 'Cantidad a generar (1 a 100). Por defecto 10.',
          schema: { type: 'integer', minimum: 1, maximum: 100, example: 2 }
        }
      ],
      responses: {
        200: ok('Datos simulados', '#/components/schemas/SuccessResponse'),
        400: err('InvalidMockQuantity')
      }
    }
  },
  '/api/mocks/seed': {
    post: {
      tags: ['Mocks'],
      summary: 'Inserta datos de prueba en MongoDB',
      description:
        'Inserta N registros de una colección. Para pedidos/entregas crea los ' +
        'datos relacionados que falten (clientes, repartidores, pedidos).',
      parameters: [
        {
          name: 'qty',
          in: 'query',
          required: false,
          description: 'Cantidad a insertar (1 a 100). Por defecto 10.',
          schema: { type: 'integer', minimum: 1, maximum: 100, example: 10 }
        },
        {
          name: 'collection',
          in: 'query',
          required: false,
          description: 'Colección a sembrar. Por defecto "users".',
          schema: {
            type: 'string',
            enum: ['users', 'drivers', 'orders', 'deliveries'],
            example: 'users'
          }
        }
      ],
      responses: {
        201: {
          description: 'Registros insertados',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  insertados: { type: 'integer', example: 10 },
                  coleccion: { type: 'string', example: 'usuarios' }
                }
              },
              example: { insertados: 10, coleccion: 'usuarios' }
            }
          }
        },
        400: err('InvalidMockQuantity'),
        500: err('MockLoadFailed')
      }
    }
  },
  '/api/mocks/generateData': {
    post: {
      tags: ['Mocks'],
      summary: 'Carga relacional completa',
      description:
        'Crea usuarios, repartidores, pedidos (ligados a usuarios) y entregas ' +
        '(ligadas a pedidos y repartidores) en una sola llamada.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                users: { type: 'integer', example: 5 },
                drivers: { type: 'integer', example: 2 },
                orders: { type: 'integer', example: 4 },
                deliveries: { type: 'integer', example: 3 }
              }
            },
            example: { users: 5, drivers: 2, orders: 4, deliveries: 3 }
          }
        }
      },
      responses: {
        201: {
          description: 'Datos insertados',
          content: {
            'application/json': {
              schema: { type: 'object' },
              example: {
                status: 'success',
                insertados: { usuarios: 5, repartidores: 2, pedidos: 4, entregas: 3 }
              }
            }
          }
        },
        400: err('InvalidMockQuantity'),
        500: err('MockLoadFailed')
      }
    }
  },

  // ---------------- LOGGER ----------------
  '/api/logs/test': {
    get: {
      tags: ['Logger'],
      summary: 'Prueba del logger (herramienta de validación)',
      description:
        'NO es una funcionalidad del negocio: dispara un log de cada nivel ' +
        '(debug, http, info, warning, error, fatal) para validar que el sistema ' +
        'de logs funciona y que los archivos se escriben en la carpeta logs/.',
      responses: {
        200: {
          description: 'Logs de prueba generados',
          content: {
            'application/json': {
              schema: { type: 'object' },
              example: {
                status: 'success',
                message: 'Se generaron logs de prueba en los 6 niveles',
                niveles: ['debug', 'http', 'info', 'warning', 'error', 'fatal']
              }
            }
          }
        }
      }
    }
  }
};
