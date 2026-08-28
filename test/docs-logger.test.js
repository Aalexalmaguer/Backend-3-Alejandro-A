import { expect } from 'chai';
import { api } from './helpers.js';

describe('Soporte: Logger, Swagger y ruta inexistente', () => {
  it('GET /api/logs/test responde 200 y genera los 6 niveles', async () => {
    const res = await api().get('/api/logs/test');
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.niveles).to.be.an('array').with.lengthOf(6);
    expect(res.body.niveles).to.include.members(['debug', 'info', 'error', 'fatal']);
  });

  it('GET /api/docs/ sirve la documentación de Swagger', async () => {
    const res = await api().get('/api/docs/');
    expect(res.status).to.equal(200);
    expect(res.text.toLowerCase()).to.include('swagger');
  });

  // Coherencia con Swagger: el 404 documentado tiene su test real.
  it('GET a una ruta inexistente → 404 ROUTE_NOT_FOUND con formato uniforme', async () => {
    const res = await api().get('/api/no-existe');
    expect(res.status).to.equal(404);
    expect(res.body.status).to.equal('error');
    expect(res.body.error).to.include.keys('code', 'message');
    expect(res.body.error.code).to.equal('ROUTE_NOT_FOUND');
  });
});
