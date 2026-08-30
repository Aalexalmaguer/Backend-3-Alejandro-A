import { expect } from 'chai';
import { api } from './helpers.js';

describe('Producción y performance (M8)', () => {
  describe('Health check', () => {
    it('GET /api/health responde 200 con estado, entorno, uptime y timestamp', async () => {
      const res = await api().get('/api/health');
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.include.keys('status', 'environment', 'database', 'uptime', 'timestamp');
      expect(res.body.data.status).to.equal('ok');
    });

    it('el health check NO expone información sensible (URI de la base)', async () => {
      const res = await api().get('/api/health');
      expect(JSON.stringify(res.body)).to.not.include('mongodb://');
      expect(res.body.data).to.not.have.property('mongoUri');
    });
  });

  describe('Paginación de listados', () => {
    it('GET /api/users?limit=2 devuelve como máximo 2 y metadatos de paginación', async () => {
      await api().post('/api/mocks/seed?qty=5'); // 5 usuarios de prueba
      const res = await api().get('/api/users?limit=2&page=1');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an('array').with.lengthOf(2);
      expect(res.body.pagination).to.include({ total: 5, page: 1, limit: 2, totalPages: 3 });
      expect(res.body.pagination.hasNextPage).to.equal(true);
      expect(res.body.pagination.hasPrevPage).to.equal(false);
    });

    it('la última página trae el resto y marca hasNextPage=false', async () => {
      await api().post('/api/mocks/seed?qty=5');
      const res = await api().get('/api/users?limit=2&page=3');

      expect(res.body.payload).to.have.lengthOf(1);
      expect(res.body.pagination.hasNextPage).to.equal(false);
      expect(res.body.pagination.hasPrevPage).to.equal(true);
    });
  });
});
