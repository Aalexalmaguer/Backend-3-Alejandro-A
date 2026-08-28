import { expect } from 'chai';
import { api } from './helpers.js';

describe('Mocks (/api/mocks)', () => {
  describe('Casos exitosos', () => {
    it('GET /api/mocks/users?qty=2 devuelve 2 usuarios SIN guardarlos', async () => {
      const res = await api().get('/api/mocks/users?qty=2');
      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an('array').with.lengthOf(2);
      expect(res.body.payload[0]).to.include.keys('firstName', 'email', 'role');

      // No debe haberse guardado nada en la base
      const users = await api().get('/api/users');
      expect(users.body.payload).to.have.lengthOf(0);
    });

    it('POST /api/mocks/seed?qty=5 inserta usuarios y responde {insertados, coleccion}', async () => {
      const res = await api().post('/api/mocks/seed?qty=5');
      expect(res.status).to.equal(201);
      expect(res.body).to.deep.equal({ insertados: 5, coleccion: 'usuarios' });

      const users = await api().get('/api/users');
      expect(users.body.payload).to.have.lengthOf(5);
    });

    it('POST /api/mocks/seed?collection=pedidos crea pedidos ligados a usuarios', async () => {
      const res = await api().post('/api/mocks/seed?qty=3&collection=pedidos');
      expect(res.status).to.equal(201);
      expect(res.body.coleccion).to.equal('pedidos');
      expect(res.body.insertados).to.equal(3);

      const orders = await api().get('/api/orders');
      expect(orders.body.payload).to.have.lengthOf(3);
      expect(orders.body.payload[0]).to.have.property('customer');
    });

    it('POST /api/mocks/generateData hace la carga relacional completa', async () => {
      const res = await api()
        .post('/api/mocks/generateData')
        .send({ users: 4, drivers: 2, orders: 3, deliveries: 2 });

      expect(res.status).to.equal(201);
      expect(res.body.insertados).to.deep.equal({
        usuarios: 4,
        repartidores: 2,
        pedidos: 3,
        entregas: 2
      });
    });
  });

  describe('Casos de error', () => {
    it('POST /api/mocks/seed?qty=0 → 400 INVALID_MOCK_QUANTITY', async () => {
      const res = await api().post('/api/mocks/seed?qty=0');
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_MOCK_QUANTITY');
    });

    it('POST /api/mocks/seed?qty=999 (mayor al tope) → 400 INVALID_MOCK_QUANTITY', async () => {
      const res = await api().post('/api/mocks/seed?qty=999');
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_MOCK_QUANTITY');
    });

    it('GET /api/mocks/coleccionRara → 400 INVALID_COLLECTION', async () => {
      const res = await api().get('/api/mocks/coleccionRara?qty=2');
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_COLLECTION');
    });
  });
});
