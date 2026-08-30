import { UserModel } from '../models/user.model.js';

/**
 * Repository de Usuarios.
 * ÚNICA capa que conoce Mongoose/MongoDB. Encapsula el acceso a datos y aplica
 * una proyección segura por defecto: nunca expone el password ni __v hacia
 * afuera. Si mañana cambia el motor de datos, solo cambia este archivo.
 */

// Proyección segura por defecto: jamás devolvemos la contraseña.
const SAFE_PROJECTION = { password: 0, __v: 0 };

export const usersRepository = {
  getAll: async (filter = {}) => {
    return UserModel.find(filter, SAFE_PROJECTION).lean();
  },

  // Consulta paginada (evita traer la colección completa sin control).
  paginate: async (filter = {}, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      UserModel.find(filter, SAFE_PROJECTION).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(filter)
    ]);
    return { docs, total, page, limit };
  },

  getById: async (id) => {
    return UserModel.findById(id, SAFE_PROJECTION).lean();
  },

  // Se usa internamente para validaciones (ej. email duplicado). Sin proyección
  // segura porque el Service necesita saber si el documento existe.
  getByEmail: async (email) => {
    return UserModel.findOne({ email }).lean();
  },

  create: async (userData) => {
    const created = await UserModel.create(userData);
    // Nunca devolvemos el password hacia las capas superiores.
    const { password, __v, ...user } = created.toObject();
    return user;
  },

  // Inserción masiva para la carga de datos de prueba (mocking).
  insertMany: async (docs) => {
    const created = await UserModel.insertMany(docs);
    return created.map((doc) => {
      const { password, __v, ...user } = doc.toObject();
      return user;
    });
  },

  update: async (id, changes) => {
    return UserModel.findByIdAndUpdate(id, changes, {
      new: true,
      runValidators: true,
      projection: SAFE_PROJECTION
    }).lean();
  },

  // Agrega los metadatos de un documento al usuario (M7).
  addDocument: async (id, metadata) => {
    return UserModel.findByIdAndUpdate(
      id,
      { $push: { documents: metadata } },
      { new: true, runValidators: true, projection: SAFE_PROJECTION }
    ).lean();
  },

  delete: async (id) => {
    return UserModel.findByIdAndDelete(id, { projection: SAFE_PROJECTION }).lean();
  }
};
