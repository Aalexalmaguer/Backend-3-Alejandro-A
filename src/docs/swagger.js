import { config } from '../config/index.js';
import { schemas } from './schemas.js';
import { responses } from './responses.js';
import { paths } from './paths.js';

/**
 * Especificación OpenAPI 3 de ShipNow.
 * Toda la documentación vive acá (separada de la lógica de rutas). El servidor
 * solo la sirve en /api/docs con swagger-ui-express.
 */
export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ShipNow API',
    version: '1.0.0',
    description:
      'API de logística ShipNow con arquitectura por capas (Controller → Service → ' +
      'Repository), sistema de mocks para datos de prueba, manejo profesional de ' +
      'errores y logging con Winston.\n\n' +
      '**Propósito:** servir de base profesional y documentada para el proyecto de ' +
      'Backend III, sobre la que se apoyan testing, documentación y despliegue.'
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Servidor local'
    }
  ],
  tags: [
    { name: 'Health', description: 'Estado de la API (health check).' },
    { name: 'Users', description: 'Gestión de usuarios (clientes, repartidores, etc.).' },
    { name: 'Products', description: 'Gestión de productos y stock.' },
    { name: 'Orders', description: 'Consulta de pedidos.' },
    { name: 'Deliveries', description: 'Consulta de entregas.' },
    { name: 'Mocks', description: 'Generación y carga de datos de prueba.' },
    { name: 'Logger', description: 'Herramienta interna de validación del logger (no es del negocio).' }
  ],
  components: {
    schemas,
    responses
  },
  paths
};
