import { ORDER_STATUS_VALUES, DELIVERY_PRIORITY_VALUES } from '../constants/index.js';
import { randomFrom, randomInt, fakeObjectId } from './helpers.js';

/**
 * Generador de pedidos (Order) de prueba.
 * Estados y prioridades salen SIEMPRE de las constantes del dominio.
 * Recibe el id del cliente para respetar la relación pedido ↔ usuario.
 */
const ITEM_NAMES = [
  'Caja mediana', 'Sobre documentos', 'Paquete grande',
  'Bolsa térmica', 'Caja pequeña', 'Pallet'
];
const ADDRESSES = [
  'Av. Siempre Viva 742', 'Calle Falsa 123', 'Reforma 500',
  'Insurgentes Sur 1234', 'Av. Central 89'
];

// Genera un pedido asociado a un customerId (obligatorio para la relación).
export const generateMockOrder = (customerId) => {
  const itemsCount = randomInt(1, 3);
  const items = Array.from({ length: itemsCount }, () => ({
    name: randomFrom(ITEM_NAMES),
    quantity: randomInt(1, 5),
    price: randomInt(100, 3000)
  }));

  const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return {
    // Si no llega un customerId real (preview), usamos uno simulado.
    customer: customerId || fakeObjectId(),
    items,
    deliveryAddress: randomFrom(ADDRESSES),
    total,
    status: randomFrom(ORDER_STATUS_VALUES),
    priority: randomFrom(DELIVERY_PRIORITY_VALUES)
  };
};

// Genera N pedidos. customerIds: lista de ids de clientes existentes.
export const generateMockOrders = (qty, customerIds = []) =>
  Array.from({ length: qty }, () =>
    generateMockOrder(
      customerIds.length ? randomFrom(customerIds) : undefined
    )
  );
