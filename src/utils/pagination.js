/**
 * Utilidades de paginación.
 * Evita que los listados grandes devuelvan la colección completa sin control.
 */
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Lee page/limit del query, con defaults y topes de seguridad.
export const resolvePageQuery = (query = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit };
};

// Construye los metadatos de paginación para la respuesta.
export const buildPaginationMeta = ({ total, page, limit }) => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
