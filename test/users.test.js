import { expect } from 'chai';
import mongoose from 'mongoose';
import { api, createValidUser } from './helpers.js';

describe('Users (/api/users)', () => {
  describe('Casos exitosos', () => {
    it('GET /api/users devuelve una lista (status success + payload array)', async () => {
      await createValidUser();
      const res = await api().get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'success');
      expect(res.body.payload).to.be.an('array').with.lengthOf(1);
      expect(res.body.payload[0]).to.include.keys('_id', 'firstName', 'email', 'role');
    });

    it('POST /api/users crea un usuario y NO devuelve el password', async () => {
      const res = await api().post('/api/users').send({
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana.unica@test.com',
        password: 'coder123'
      });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.include({ email: 'ana.unica@test.com', role: 'user' });
      expect(res.body.payload).to.have.property('_id');
      expect(res.body.payload).to.not.have.property('password');
    });
  });

  describe('Casos de error', () => {
    it('POST /api/users con datos incompletos → 400 VALIDATION_ERROR', async () => {
      const res = await api().post('/api/users').send({ firstName: 'Solo nombre' });

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('error');
      expect(res.body.error).to.include({ code: 'VALIDATION_ERROR' });
      expect(res.body.error).to.have.property('message').that.is.a('string');
    });

    it('POST /api/users con email duplicado → 409 DUPLICATE_EMAIL', async () => {
      const data = {
        firstName: 'Dup',
        lastName: 'Licado',
        email: 'dup@test.com',
        password: 'coder123'
      };
      await api().post('/api/users').send(data);
      const res = await api().post('/api/users').send(data);

      expect(res.status).to.equal(409);
      expect(res.body.error.code).to.equal('DUPLICATE_EMAIL');
    });

    it('GET /api/users/:id inexistente → 404 USER_NOT_FOUND', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await api().get(`/api/users/${id}`);

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('USER_NOT_FOUND');
    });
  });
});
