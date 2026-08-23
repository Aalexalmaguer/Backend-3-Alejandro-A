import { usersRepository } from '../repositories/users.repository.js';
import { ordersRepository } from '../repositories/orders.repository.js';
import { deliveriesRepository } from '../repositories/deliveries.repository.js';
import { USER_ROLES } from '../constants/index.js';
import {
  generateMockUsers,
  generateMockDrivers
} from '../mocks/users.mock.js';
import { generateMockOrders } from '../mocks/orders.mock.js';
import { generateMockDeliveries } from '../mocks/deliveries.mock.js';
import { createError } from '../utils/errors/index.js';
import { logger } from '../config/logger.js';

/**
 * Service de Mocking: concentra la lógica de generación y carga de datos.
 * No conoce Express (no recibe req/res) ni Mongoose (usa los repositories).
 * Respeta las relaciones del dominio: pedido ↔ usuario, entrega ↔ pedido ↔
 * repartidor, y valida cantidades para no llenar la base sin control.
 */

// Tope de seguridad para no insertar datos de más por accidente.
const MAX_MOCK_ITEMS = 100;

// Colecciones soportadas (acepta nombre en inglés o español) → etiqueta ES.
const COLLECTIONS = {
  users: 'usuarios',
  usuarios: 'usuarios',
  drivers: 'repartidores',
  repartidores: 'repartidores',
  orders: 'pedidos',
  pedidos: 'pedidos',
  deliveries: 'entregas',
  entregas: 'entregas'
};

const parseQty = (value, fallback = 10) => {
  const qty = Number(value ?? fallback);
  if (!Number.isInteger(qty)) {
    throw createError('INVALID_MOCK_QUANTITY', '"qty" debe ser un número entero');
  }
  if (qty <= 0) {
    // Cubre cantidad inválida y valores negativos.
    throw createError('INVALID_MOCK_QUANTITY', '"qty" debe ser mayor a 0 (no se aceptan 0 ni negativos)');
  }
  if (qty > MAX_MOCK_ITEMS) {
    throw createError('INVALID_MOCK_QUANTITY', `"qty" no puede superar ${MAX_MOCK_ITEMS}`);
  }
  return qty;
};

const idsOf = (docs) => docs.map((d) => d._id);

/**
 * Envuelve una inserción en la base para responder de forma controlada si
 * MongoDB falla durante la carga de datos de prueba (MOCK_LOAD_FAILED).
 */
const safeLoad = async (operation) => {
  try {
    return await operation();
  } catch (err) {
    logger.error(`Fallo al cargar datos de prueba en MongoDB: ${err.message}`);
    throw createError('MOCK_LOAD_FAILED');
  }
};

// --- Prerrequisitos: garantizan que existan datos relacionados ---------------

const ensureCustomers = async (min) => {
  let customers = await usersRepository.getAll({ role: USER_ROLES.USER });
  if (customers.length < min) {
    const created = await safeLoad(() =>
      usersRepository.insertMany(generateMockUsers(min - customers.length, USER_ROLES.USER))
    );
    customers = customers.concat(created);
  }
  return customers;
};

const ensureDrivers = async (min) => {
  let drivers = await usersRepository.getAll({ role: USER_ROLES.DRIVER });
  if (drivers.length < min) {
    const created = await safeLoad(() =>
      usersRepository.insertMany(generateMockDrivers(min - drivers.length))
    );
    drivers = drivers.concat(created);
  }
  return drivers;
};

const ensureOrders = async (min) => {
  let orders = await ordersRepository.getAll();
  if (orders.length < min) {
    const customers = await ensureCustomers(Math.min(min, 5));
    const created = await safeLoad(() =>
      ordersRepository.insertMany(generateMockOrders(min - orders.length, idsOf(customers)))
    );
    orders = orders.concat(created);
  }
  return orders;
};

export const mocksService = {
  /**
   * PREVIEW: devuelve datos simulados SIN guardarlos en la base.
   * Las relaciones (customer, order, driver) se llenan con ids simulados.
   */
  preview: (collection = 'users', qtyRaw) => {
    const key = COLLECTIONS[String(collection).toLowerCase()];
    if (!key) {
      throw createError(
        'INVALID_COLLECTION',
        `Colección inválida. Opciones: ${Object.keys(COLLECTIONS).join(', ')}`
      );
    }
    const qty = parseQty(qtyRaw);
    logger.debug(`Mocks (preview): generando ${qty} "${key}" sin guardar`);

    switch (key) {
      case 'usuarios':
        return generateMockUsers(qty);
      case 'repartidores':
        return generateMockDrivers(qty);
      case 'pedidos':
        return generateMockOrders(qty);
      case 'entregas':
        return generateMockDeliveries(qty);
      default:
        return [];
    }
  },

  /**
   * SEED: inserta datos de prueba en MongoDB de forma controlada.
   * Devuelve { insertados, coleccion } tal como espera la consigna.
   */
  seed: async (collection = 'users', qtyRaw) => {
    const key = COLLECTIONS[String(collection).toLowerCase()];
    if (!key) {
      throw createError(
        'INVALID_COLLECTION',
        `Colección inválida. Opciones: ${Object.keys(COLLECTIONS).join(', ')}`
      );
    }
    const qty = parseQty(qtyRaw);

    let inserted;
    switch (key) {
      case 'usuarios':
        inserted = await safeLoad(() => usersRepository.insertMany(generateMockUsers(qty)));
        break;
      case 'repartidores':
        inserted = await safeLoad(() => usersRepository.insertMany(generateMockDrivers(qty)));
        break;
      case 'pedidos': {
        // Relación pedido ↔ usuario: aseguramos clientes antes de crear pedidos.
        const customers = await ensureCustomers(Math.min(qty, 5));
        inserted = await safeLoad(() =>
          ordersRepository.insertMany(generateMockOrders(qty, idsOf(customers)))
        );
        break;
      }
      case 'entregas': {
        // Relación entrega ↔ pedido ↔ repartidor.
        const [orders, drivers] = await Promise.all([
          ensureOrders(Math.min(qty, 5)),
          ensureDrivers(Math.min(qty, 3))
        ]);
        inserted = await safeLoad(() =>
          deliveriesRepository.insertMany(generateMockDeliveries(qty, idsOf(orders), idsOf(drivers)))
        );
        break;
      }
      default:
        inserted = [];
    }

    logger.info(`Mocks: insertados ${inserted.length} registros en "${key}"`);
    return { insertados: inserted.length, coleccion: key };
  },

  /**
   * GENERATE DATA: carga relacional completa en una sola llamada.
   * Crea clientes, repartidores, pedidos (ligados a clientes) y entregas
   * (ligadas a pedidos y repartidores), respetando todas las relaciones.
   */
  generateData: async ({ users = 0, drivers = 0, orders = 0, deliveries = 0 }) => {
    const uQty = users ? parseQty(users) : 0;
    const dQty = drivers ? parseQty(drivers) : 0;
    const oQty = orders ? parseQty(orders) : 0;
    const delQty = deliveries ? parseQty(deliveries) : 0;

    if (uQty + dQty + oQty + delQty === 0) {
      throw createError(
        'INVALID_MOCK_QUANTITY',
        'Indicá al menos una cantidad: users, drivers, orders o deliveries'
      );
    }

    // 1) Clientes y repartidores
    const createdUsers = uQty
      ? await safeLoad(() => usersRepository.insertMany(generateMockUsers(uQty, USER_ROLES.USER)))
      : [];
    const createdDrivers = dQty
      ? await safeLoad(() => usersRepository.insertMany(generateMockDrivers(dQty)))
      : [];

    // 2) Pedidos ligados a clientes existentes (o recién creados)
    let createdOrders = [];
    if (oQty) {
      const customers = createdUsers.length
        ? createdUsers
        : await ensureCustomers(Math.min(oQty, 5));
      createdOrders = await safeLoad(() =>
        ordersRepository.insertMany(generateMockOrders(oQty, idsOf(customers)))
      );
    }

    // 3) Entregas ligadas a pedidos y repartidores
    let createdDeliveries = [];
    if (delQty) {
      const orderPool = createdOrders.length
        ? createdOrders
        : await ensureOrders(Math.min(delQty, 5));
      const driverPool = createdDrivers.length
        ? createdDrivers
        : await ensureDrivers(Math.min(delQty, 3));
      createdDeliveries = await safeLoad(() =>
        deliveriesRepository.insertMany(generateMockDeliveries(delQty, idsOf(orderPool), idsOf(driverPool)))
      );
    }

    const resumen = {
      usuarios: createdUsers.length,
      repartidores: createdDrivers.length,
      pedidos: createdOrders.length,
      entregas: createdDeliveries.length
    };
    logger.info(
      `Mocks (generateData): ${resumen.usuarios} usuarios, ${resumen.repartidores} repartidores, ` +
        `${resumen.pedidos} pedidos, ${resumen.entregas} entregas`
    );
    return { insertados: resumen };
  }
};
