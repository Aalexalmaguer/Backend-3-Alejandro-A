import { DELIVERY_STATUS_VALUES, DELIVERY_PRIORITY_VALUES } from '../constants/index.js';
import { randomFrom, fakeObjectId } from './helpers.js';

/**
 * Generador de entregas (Delivery) de prueba.
 * Respeta las relaciones entrega ↔ pedido y entrega ↔ repartidor.
 * Estados y prioridades salen de las constantes del dominio.
 */
export const generateMockDelivery = (orderId, driverId) => ({
  // Si no llegan ids reales (preview), usamos simulados.
  order: orderId || fakeObjectId(),
  driver: driverId || fakeObjectId(),
  status: randomFrom(DELIVERY_STATUS_VALUES),
  priority: randomFrom(DELIVERY_PRIORITY_VALUES)
});

// Genera N entregas. orderIds y driverIds: ids reales existentes.
export const generateMockDeliveries = (qty, orderIds = [], driverIds = []) =>
  Array.from({ length: qty }, () =>
    generateMockDelivery(
      orderIds.length ? randomFrom(orderIds) : undefined,
      driverIds.length ? randomFrom(driverIds) : undefined
    )
  );
