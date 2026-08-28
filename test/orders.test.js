import { expect } from 'chai';
import mongoose from 'mongoose';
import { api, createValidUser } from './helpers.js';

const validOrderBody = (customerId) => ({
  customer: customerId,
  deliveryAddress: 'Av. Reforma 500',
  items: [
    { name: 'Caja mediana', quantity: 2, price: 1500 },
    { name: 'Sobre', quantity: 1, price: 200 }
  ]
});

describe('Orders (/api/orders)', () => {
  describe('Casos exitosos', () => {
    it('POST /api/orders crea un pedido con datos válidos (total calculado, estado created)', async () => {
      const user = await createValidUser();
      const res = await api().post('/api/orders').send(validOrderBody(user._id));

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      const order = res.body.payload;
      expect(order).to.include.keys('_id', 'customer', 'items', 'total', 'status');
      expect(order.customer).to.equal(user._id);
      expect(order.total).to.equal(2 * 1500 + 1 * 200); // 3200, calculado por el service
      expect(order.status).to.equal('created');
    });

    it('GET /api/orders/:id devuelve el pedido creado', async () => {
      const user = await createValidUser();
      const created = (await api().post('/api/orders').send(validOrderBody(user._id))).body.payload;

      const res = await api().get(`/api/orders/${created._id}`);
      expect(res.status).to.equal(200);
      expect(res.body.payload._id).to.equal(created._id);
      expect(res.body.payload.total).to.equal(3200);
    });

    it('PATCH /api/orders/:id/status actualiza a un estado válido', async () => {
      const user = await createValidUser();
      const created = (await api().post('/api/orders').send(validOrderBody(user._id))).body.payload;

      const res = await api().patch(`/api/orders/${created._id}/status`).send({ status: 'in_transit' });
      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal('in_transit');
    });
  });

  describe('Casos de error', () => {
    it('POST /api/orders con datos incompletos → 400 VALIDATION_ERROR', async () => {
      const res = await api().post('/api/orders').send({ deliveryAddress: 'Sin customer ni items' });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });

    it('POST /api/orders con customer inexistente → 404 USER_NOT_FOUND', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await api().post('/api/orders').send(validOrderBody(id));

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('USER_NOT_FOUND');
    });

    it('GET /api/orders/:id inexistente → 404 ORDER_NOT_FOUND', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await api().get(`/api/orders/${id}`);

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('ORDER_NOT_FOUND');
    });

    it('PATCH /api/orders/:id/status con estado inválido → 400 INVALID_ORDER_STATUS', async () => {
      const user = await createValidUser();
      const created = (await api().post('/api/orders').send(validOrderBody(user._id))).body.payload;

      const res = await api().patch(`/api/orders/${created._id}/status`).send({ status: 'volando' });
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_ORDER_STATUS');
    });
  });
});
