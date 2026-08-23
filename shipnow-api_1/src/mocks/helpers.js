/**
 * Utilidades de generación aleatoria para los mocks.
 * No dependen de Express ni de Mongoose: son funciones puras reutilizables.
 */

// Elige un elemento aleatorio de un array.
export const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Entero aleatorio entre min y max (ambos incluidos).
export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Genera un string de 24 caracteres hex, con forma de ObjectId de Mongo.
// Se usa SOLO en los previews (GET) para simular refs sin tocar la base.
export const fakeObjectId = () => {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i++) id += hex[Math.floor(Math.random() * 16)];
  return id;
};

// Contador para asegurar emails únicos dentro de una misma corrida.
let counter = 0;
export const nextSeq = () => ++counter;
