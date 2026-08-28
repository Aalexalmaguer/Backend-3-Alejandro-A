import request from 'supertest';
import { createApp } from '../src/app.js';

/**
 * App de Express lista para testear (sin abrir un puerto: la app está separada
 * del arranque del servidor, así Supertest la importa directamente).
 */
export const app = createApp();

// Wrapper de Supertest sobre la app.
export const api = () => request(app);

// Crea un usuario válido y devuelve su payload. Email aleatorio para no chocar.
export const createValidUser = async (overrides = {}) => {
  const rand = `${Date.now()}${Math.random().toString(16).slice(2, 8)}`;
  const res = await api()
    .post('/api/users')
    .send({
      firstName: 'Test',
      lastName: 'User',
      email: `test.${rand}@test.com`,
      password: 'coder123',
      ...overrides
    });
  return res.body.payload;
};
