import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Configuración global del entorno de testing (separado de desarrollo).
 *
 * - Fuerza NODE_ENV=test (el logger queda silenciado y no escribe archivos).
 *   Esto se ejecuta al cargar el archivo, ANTES de importar la app.
 * - Define una MONGODB_URI temporal para que la validación de config no falle
 *   al importar la app (el valor real de conexión lo da la base en memoria).
 * - Levanta una base de datos MongoDB EN MEMORIA: los datos son descartables,
 *   no se toca ninguna base real y cada corrida arranca limpia.
 * - Limpia todas las colecciones después de cada test (datos repetibles).
 */
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shipnow-test-placeholder';

let mongod;

// Root Hook Plugin de Mocha: se aplica a toda la suite.
export const mochaHooks = {
  // Conexión de testing. Por defecto usa una base EN MEMORIA (descartable).
  // Si se define MONGODB_URI_TEST, usa esa base separada en su lugar.
  beforeAll: async function () {
    this.timeout(120000); // la primera vez descarga el binario de Mongo
    if (process.env.MONGODB_URI_TEST) {
      await mongoose.connect(process.env.MONGODB_URI_TEST);
    } else {
      mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri('shipnow-test'));
    }
  },

  // Estrategia de limpieza: vacía todas las colecciones después de cada test,
  // para que ningún test dependa del estado dejado por otro.
  afterEach: async function () {
    const { collections } = mongoose.connection;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  },

  // Cierra la conexión, detiene la base en memoria y borra los archivos de test.
  afterAll: async function () {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
    fs.rmSync(path.resolve('uploads-test'), { recursive: true, force: true });
  }
};
