# ShipNow API

API base de la plataforma de logística **ShipNow**, refactorizada a una
**arquitectura profesional por capas** (Controller → Service → Repository) con
un sistema de **configuración de entorno validada** y **constantes de dominio**.

Este repositorio es la base del proyecto para Backend III y se irá ampliando en
las próximas entregas (manejo de errores, logger, documentación, testing y Docker).

> Estado actual:
> - **M1** — arquitectura por capas para **Products** y **Users** + config de entorno validada.
> - **M2** — sistema de **mocking** (`/api/mocks`) para generar y cargar datos de
>   prueba de **usuarios, repartidores, pedidos y entregas**.
> - **M3** — **manejo profesional de errores**: diccionario de errores, errores
>   personalizados y un middleware global que unifica todas las respuestas de error.
> - **M4** — **logging y monitoreo básico** con Winston: logger centralizado,
>   niveles de log, integración con el manejo de errores, persistencia en archivos
>   con rotación y un endpoint de prueba.
> - **M5** — **documentación con Swagger/OpenAPI**: Swagger UI en `/api/docs`,
>   endpoints agrupados por tags, schemas reutilizables y errores documentados.
> - **M6** — **testing funcional** con Mocha, Chai y Supertest: suite de tests de
>   los endpoints principales (casos exitosos y de error) sobre una base de datos
>   de testing en memoria.
> - **M7** — **carga de archivos** con Multer: documentos de usuario y comprobantes
>   de pedidos/entregas; solo se guardan metadatos en la base y los archivos van a
>   `uploads/` (ignorada en git).
> - **M8** — **performance, producción y Docker**: paginación en los listados,
>   config por entorno, health check, y contenerización con `Dockerfile` + `.dockerignore`.

---

## Arquitectura

El flujo de una petición es siempre en un solo sentido:

```
Request HTTP
   ↓
Router        → conecta el path con el método del Controller
   ↓
Controller    → única puerta de entrada HTTP (lee req, arma res)
   ↓
Service       → lógica de negocio (reglas del dominio, validaciones)
   ↓
Repository    → único lugar que conoce Mongoose/MongoDB
   ↓
Model / MongoDB
```

### Estructura de carpetas

```
src/
├── config/
│   ├── index.js          # dotenv + validación de variables de entorno
│   ├── database.js       # conexión centralizada a MongoDB
│   ├── logger.js         # logger centralizado (Winston) + rotación de archivos
│   └── multer.js         # config centralizada de Multer (destino, tipos, tamaño)
├── constants/
│   └── index.js          # roles, estados y prioridades (Object.freeze) — sin strings mágicos
├── controllers/
│   ├── products.controller.js
│   ├── users.controller.js
│   ├── orders.controller.js
│   ├── deliveries.controller.js
│   ├── mocks.controller.js
│   ├── logs.controller.js    # endpoint de prueba del logger
│   ├── health.controller.js  # health check
│   └── files.controller.js   # carga de archivos
├── docs/                     # configuración de Swagger (separada de las rutas)
│   ├── swagger.js            # spec OpenAPI (info, servers, tags, components, paths)
│   ├── schemas.js            # schemas reutilizables (User, Order, Delivery, ...)
│   ├── responses.js          # respuestas de error reutilizables
│   └── paths.js              # endpoints documentados, agrupados por tag
├── middlewares/
│   ├── errorHandler.js   # middleware global de errores + ruta no encontrada
│   ├── httpLogger.js     # loguea cada petición HTTP (nivel http)
│   └── entityExists.js   # valida que la entidad exista ANTES de subir el archivo
├── mocks/                # generadores de datos de prueba (funciones puras, sin DB)
│   ├── helpers.js
│   ├── users.mock.js
│   ├── orders.mock.js
│   └── deliveries.mock.js
├── models/
│   ├── product.model.js  # solo el esquema de Mongoose
│   ├── user.model.js
│   ├── order.model.js    # pedido (ref a User)
│   └── delivery.model.js # entrega (ref a Order y a User/driver)
├── repositories/
│   ├── products.repository.js
│   ├── users.repository.js
│   ├── orders.repository.js
│   └── deliveries.repository.js
├── routes/
│   ├── index.js
│   ├── products.router.js
│   ├── users.router.js
│   ├── orders.router.js
│   ├── deliveries.router.js
│   ├── mocks.router.js
│   └── logs.router.js
├── services/
│   ├── products.service.js
│   ├── users.service.js
│   └── mocks.service.js  # generación + carga controlada, respeta relaciones
├── utils/
│   ├── pagination.js     # helpers de paginación (page/limit + metadatos)
│   └── errors/
│       ├── errorDictionary.js  # diccionario: code + status + message
│       ├── AppError.js         # error personalizado + factory createError
│       └── index.js
├── app.js                # construye la app Express
└── server.js             # arranque: valida config → conecta DB → escucha
```

---

## Requisitos

- Node.js 18 o superior (usa ES Modules y `--watch`)
- Una instancia de MongoDB (local o Atlas)

## Instalación y ejecución

1. Cloná el repositorio e instalá dependencias:

   ```bash
   git clone <url-del-repo>
   cd shipnow-api
   npm install
   ```

2. Creá tu archivo `.env` a partir del ejemplo y completá los valores:

   ```bash
   cp .env.example .env
   ```

   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/shipnow
   NODE_ENV=development
   ```

3. Levantá el servidor:

   ```bash
   npm run dev     # modo desarrollo (recarga con --watch)
   # o
   npm start       # modo normal
   ```

Si todo está bien, verás:

```
[db] Conectado a MongoDB
[server] ShipNow escuchando en http://localhost:8080
```

> **Robustez:** si borrás `MONGODB_URI` del `.env`, la app **no arranca** y
> muestra un error claro (`Faltan variables de entorno obligatorias: MONGODB_URI`)
> en lugar de fallar más tarde con un mensaje confuso.

---

## Producción y Docker (M8)

### Variables de entorno

Todas las configuraciones se leen de forma centralizada en `src/config/index.js`
(nunca hay valores sensibles escritos en el código). Ver `.env.example`:

| Variable | Obligatoria | Descripción |
| -------- | ----------- | ----------- |
| `MONGODB_URI` | **Sí** | Cadena de conexión a MongoDB. Si falta, la app **no arranca**. |
| `PORT` | No | Puerto de la API (por defecto `8080`). |
| `NODE_ENV` | No | `development` \| `test` \| `production` (por defecto `development`). |
| `LOG_LEVEL` | No | Nivel de logs. Por defecto `debug` en dev, `info` en prod. |
| `JWT_SECRET` | No | Secreto para JWT (para cuando se agregue autenticación). |
| `EXTERNAL_SERVICE_URL` | No | URL de servicios externos (integraciones futuras). |
| `ENABLE_INTERNAL_ENDPOINTS` | No | `true` para exponer `/mocks` y `/logs` en producción. |

### Ejecutar localmente

```bash
npm install
cp .env.example .env      # y completá MONGODB_URI
npm run dev               # desarrollo (recarga con --watch)
npm start                 # modo normal
npm test                  # corre la suite de tests
```

### Performance

- Los listados (`/users`, `/orders`, `/deliveries`, `/products`) están **paginados**
  con `?page` y `?limit` (por defecto 10, máximo 100); **nunca** devuelven la
  colección completa sin control. La respuesta incluye un objeto `pagination`
  (`total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`).
- La carga de archivos tiene límites de tipo y tamaño (5 MB), y los uploads no van al repo.
- En producción el nivel de logs sube a `info`, así no se registran `http`/`debug`
  en cada request (evita logs excesivos).

### Health check

`GET /api/health` → estado de la API, entorno, conexión a la base, uptime y
timestamp. **No expone información sensible** (nunca la URI de la base ni secretos).

### Endpoints internos en producción

**Criterio aplicado:** los endpoints internos `/api/mocks` y `/api/logs` son
herramientas de desarrollo, por lo que quedan **deshabilitados en `production`**
(responden 404). Se pueden reactivar con `ENABLE_INTERNAL_ENDPOINTS=true`. El health
check y la documentación Swagger quedan siempre disponibles.

### Docker

El proyecto incluye un `Dockerfile` (imagen `node:20-alpine`, instala solo
dependencias de producción, expone el puerto `8080` y arranca con `npm start`) y
un `.dockerignore` que evita copiar archivos innecesarios o sensibles a la imagen
(`node_modules`, `.env`, `.git`, `logs/`, `uploads/`, `test/`, `coverage`, temporales).

```bash
# 1. Construir la imagen
docker build -t shipnow-api .

# 2. Ejecutar el contenedor pasando las variables de entorno
docker run -p 8080:8080 --env-file .env shipnow-api
```

Con el contenedor corriendo, podés probar:

- Health check: `http://localhost:8080/api/health`
- Swagger: `http://localhost:8080/api/docs`
- Algún endpoint principal: `http://localhost:8080/api/users`

> **Nota sobre `MONGODB_URI` en Docker:** si tu MongoDB corre en tu máquina host,
> usá `host.docker.internal` (Mac/Windows) o la IP del host en la URI, o levantá
> un contenedor de MongoDB aparte. Sin `MONGODB_URI` válida el contenedor no arranca
> (falla al inicio con un mensaje claro, como se espera).

> **Logs y uploads en Docker:** se generan **dentro** del contenedor y son
> efímeros (se pierden al recrearlo). Para conservarlos, montá volúmenes:
> `-v $(pwd)/logs:/app/logs -v $(pwd)/uploads:/app/uploads`. Nunca se suben al repo.

---

## Documentación interactiva (Swagger) — M5

La API está documentada con **Swagger / OpenAPI 3**. Con el servidor levantado,
abrí en el navegador:

```
http://localhost:8080/api/docs
```

Desde ahí se pueden **consultar y probar** todos los endpoints (botón
*"Try it out"*). La configuración de Swagger vive **separada** de las rutas, en
`src/docs/` (`swagger.js`, `schemas.js`, `responses.js`, `paths.js`).

Qué incluye la documentación:

- **Información general**: nombre, versión, descripción, servidor local y propósito.
- **Agrupación por tags**: `Users`, `Products`, `Orders`, `Deliveries`, `Mocks`, `Logger`.
- **Cada endpoint**: método, ruta, descripción, parámetros de ruta/query, body
  esperado, respuesta exitosa y posibles respuestas de error.
- **Schemas reutilizables**: `User`, `Product`, `Order`, `Delivery`, `OrderItem`,
  `SuccessResponse` y `ErrorResponse`.
- **Errores documentados** que coinciden con los reales del proyecto (mismo
  `code`, mismo status): datos inválidos, recurso no encontrado, email duplicado,
  cantidad de mocks inválida, error interno, etc.
- El endpoint del **logger** aparece documentado aclarando que es una herramienta
  de validación, **no** una funcionalidad del negocio.

> La documentación refleja la API real: los enums de los schemas (roles, estados,
> prioridades) se toman de las mismas constantes del dominio que usa el código.

---

## Endpoints

Base: `/api`

### Products (`/api/products`)

| Método | Ruta                     | Descripción                                    |
| ------ | ------------------------ | ---------------------------------------------- |
| GET    | `/products`              | Lista productos. `?available=true` → solo con stock |
| GET    | `/products/:id`          | Obtiene un producto por id                     |
| POST   | `/products`              | Crea un producto (el estado se deriva del stock) |
| PATCH  | `/products/:id/stock`    | Actualiza el stock y recalcula el estado       |
| DELETE | `/products/:id`          | Elimina un producto                            |

Ejemplo de creación:

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{ "name": "Caja mediana", "price": 1500, "stock": 10 }'
```

### Users (`/api/users`)

| Método | Ruta            | Descripción                                       |
| ------ | --------------- | ------------------------------------------------- |
| GET    | `/users`        | Lista usuarios (nunca devuelve el password)       |
| GET    | `/users/:id`    | Obtiene un usuario por id                          |
| POST   | `/users`        | Crea un usuario (valida rol y email único)         |
| DELETE | `/users/:id`    | Elimina un usuario                                 |

### Orders (`/api/orders`) y Deliveries (`/api/deliveries`)

Pedidos y entregas se **generan con el módulo de mocks** y se pueden consultar:

| Método | Ruta                | Descripción                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/orders`           | Lista los pedidos              |
| GET    | `/orders/:id`       | Obtiene un pedido por id       |
| GET    | `/deliveries`       | Lista las entregas             |
| GET    | `/deliveries/:id`   | Obtiene una entrega por id     |

### Mocking (`/api/mocks`) — M2

Router dedicado a **datos de prueba**. Sirve para probar la API sin cargar
datos a mano. La lógica de generación vive en `src/mocks/` y en
`mocks.service.js`; el router solo enruta. Todos los datos generados respetan
los modelos reales y usan las **constantes del dominio** (roles, estados y
prioridades), y las relaciones **pedido ↔ usuario** y **entrega ↔ pedido ↔
repartidor** se mantienen coherentes.

| Método | Ruta                          | Guarda en DB | Descripción |
| ------ | ----------------------------- | ------------ | ----------- |
| GET    | `/mocks/:collection?qty=N`    | ❌ No        | Devuelve N datos simulados. `:collection` = `users` \| `drivers` \| `orders` \| `deliveries` |
| POST   | `/mocks/seed?qty=N&collection=users` | ✅ Sí | Inserta N registros de una colección. `collection` por defecto `users`. Responde `{ insertados, coleccion }` |
| POST   | `/mocks/generateData`         | ✅ Sí        | Carga relacional completa. Body: `{ "users": 5, "drivers": 2, "orders": 4, "deliveries": 3 }` |

Notas:

- `qty` debe ser un entero entre 1 y 100 (tope de seguridad para no llenar la base).
- `seed` de `pedidos`/`entregas` **crea automáticamente** los datos relacionados
  que falten (clientes, repartidores, pedidos) para que las relaciones sean válidas.

**Ejemplos**

Datos simulados sin guardar:

```bash
# GET /api/mocks/users?qty=2  →  { "status": "success", "payload": [ ...2 usuarios... ] }
curl "http://localhost:8080/api/mocks/users?qty=2"
```

Insertar en MongoDB de forma controlada:

```bash
# POST /api/mocks/seed?qty=10  →  { "insertados": 10, "coleccion": "usuarios" }
curl -X POST "http://localhost:8080/api/mocks/seed?qty=10"

# Sembrar pedidos (crea clientes si no existen):
curl -X POST "http://localhost:8080/api/mocks/seed?qty=5&collection=pedidos"
```

Carga relacional completa (usuarios → pedidos → entregas):

```bash
curl -X POST "http://localhost:8080/api/mocks/generateData" \
  -H "Content-Type: application/json" \
  -d '{ "users": 5, "drivers": 2, "orders": 4, "deliveries": 3 }'
# → { "status": "success", "insertados": { "usuarios": 5, "repartidores": 2, "pedidos": 4, "entregas": 3 } }
```

> Los endpoints de mocking son una herramienta de **desarrollo/testing**. En un
> entorno real conviene protegerlos o desactivarlos en producción.

---

## Manejo de errores (M3)

Toda la API responde los errores con una **estructura única y predecible**.
Ningún controller ni router arma respuestas de error a mano: las capas (sobre
todo los **Services**) *lanzan* errores del dominio, y un **middleware global**
es el único que los transforma en la respuesta HTTP final.

Piezas:

- **Diccionario de errores** (`src/utils/errors/errorDictionary.js`): un solo
  lugar con cada caso del dominio y su `code`, `status` HTTP y `message`.
- **Error personalizado** (`AppError` + factory `createError`): los services
  lanzan, por ejemplo, `throw createError('USER_NOT_FOUND')`.
- **Middleware global** (`src/middlewares/errorHandler.js`): normaliza cualquier
  error —incluidos los de Mongoose (id inválido, validación, email duplicado)—
  y construye la respuesta. También hay un handler de **ruta no encontrada**.

### Estructura de la respuesta de error

```json
{
  "status": "error",
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Usuario no encontrado"
  }
}
```

Las respuestas exitosas mantienen su forma: `{ "status": "success", "payload": ... }`.

### Diccionario (resumen)

| code                    | HTTP | Cuándo ocurre                                   |
| ----------------------- | ---- | ----------------------------------------------- |
| `VALIDATION_ERROR`      | 400  | Faltan campos o son inválidos                   |
| `INVALID_ID`            | 400  | Id con formato inválido (CastError de Mongo)    |
| `INVALID_ROLE`          | 400  | Rol de usuario no permitido                     |
| `INVALID_PRODUCT_DATA`  | 400  | Datos de producto inválidos (ej. precio negativo) |
| `INVALID_MOCK_QUANTITY` | 400  | `qty` inválida, 0, negativa o mayor a 100       |
| `INVALID_COLLECTION`    | 400  | Colección de mocks inexistente                  |
| `USER_NOT_FOUND`        | 404  | Usuario inexistente                             |
| `PRODUCT_NOT_FOUND`     | 404  | Producto inexistente                            |
| `ORDER_NOT_FOUND`       | 404  | Pedido inexistente                              |
| `ROUTE_NOT_FOUND`       | 404  | Ruta no registrada                              |
| `DUPLICATE_EMAIL`       | 409  | Email de usuario repetido                       |
| `MOCK_LOAD_FAILED`      | 500  | Falló la inserción de datos de prueba en MongoDB|
| `INTERNAL_SERVER_ERROR` | 500  | Error inesperado no controlado                  |

### Cómo probar los casos inválidos

```bash
# 404 uniforme
curl -i http://localhost:8080/api/users/000000000000000000000000
# → 404 { "status":"error", "error":{ "code":"USER_NOT_FOUND", ... } }

# 400 validación
curl -i -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" -d '{ "firstName": "Ana" }'
# → 400 VALIDATION_ERROR

# 409 email duplicado (crear dos veces el mismo email)
# → 409 DUPLICATE_EMAIL

# Mocks: cantidad inválida / negativa / excedida
curl -i -X POST "http://localhost:8080/api/mocks/seed?qty=-5"    # 400 INVALID_MOCK_QUANTITY
curl -i -X POST "http://localhost:8080/api/mocks/seed?qty=999"   # 400 INVALID_MOCK_QUANTITY
curl -i  "http://localhost:8080/api/mocks/coleccionRara?qty=2"   # 400 INVALID_COLLECTION
```

> Si MongoDB falla durante una carga de mocks, la API no se cae: responde
> `500 MOCK_LOAD_FAILED` con el mismo formato uniforme.

---

## Logging y monitoreo (M4)

El proyecto usa **Winston** como logger **centralizado** (`src/config/logger.js`).
Reemplaza a `console.log`: cualquier módulo importa el mismo `logger` y registra
eventos con un nivel de importancia. Cada registro tiene el formato
**`timestamp [nivel]  mensaje`**.

### Niveles de log

De más grave a menos grave: `fatal` → `error` → `warning` → `info` → `http` → `debug`.

| Nivel     | Se usa para… |
| --------- | ------------ |
| `fatal`   | Fallas críticas de arranque/configuración (ej. no conecta a MongoDB) |
| `error`   | Errores inesperados del servidor (5xx), fallo de carga de mocks |
| `warning` | Errores esperados / de negocio (4xx): recurso no encontrado, validación |
| `info`    | Eventos normales: servidor iniciado, DB conectada, entidad/mock creados |
| `http`    | Cada petición HTTP recibida |
| `debug`   | Detalle de desarrollo (ej. preview de mocks) |

### Comportamiento por entorno

Se apoya en `NODE_ENV` (M1):

- **development** → registra desde `debug` (muestra todo).
- **production** → registra desde `info` (oculta `debug` y `http`).

### Persistencia y rotación

Los logs se guardan en la carpeta **`logs/`** con **rotación diaria** (un archivo
por día, máx. 5 MB, se conservan 14 días, comprimidos):

- `logs/combined-YYYY-MM-DD.log` → todos los niveles según el entorno.
- `logs/error-YYYY-MM-DD.log` → **solo `error` y `fatal`** (nunca `info` ni `debug`).

> La carpeta `logs/` y los `*.log` están en `.gitignore`: los archivos generados
> por la aplicación **no se suben** al repositorio. La carpeta se crea sola al
> arrancar.

### Integración con el manejo de errores

El logger **no reemplaza** al manejo de errores del M3, lo **complementa**: el
middleware global sigue construyendo la respuesta uniforme al cliente y, además,
registra cada error (4xx como `warning`, 5xx como `error`).

### Endpoint de prueba

Para verificar que todos los niveles funcionan:

```bash
# GET /api/logs/test → dispara un log de cada nivel (debug, http, info, warning, error, fatal)
curl http://localhost:8080/api/logs/test
```

Después de llamarlo, revisá la **consola** (con colores) y la carpeta **`logs/`**:
`combined-*.log` tendrá los 6 niveles y `error-*.log` solo `error` y `fatal`.

---

## Carga de archivos (M7)

La API permite subir **documentos** (asociados a un usuario) y **comprobantes**
(asociados a un pedido o una entrega) vía `multipart/form-data` con **Multer**.
En la base se guardan **solo los metadatos**; el archivo se guarda en el servidor.

### Configuración

Toda la config de Multer está **centralizada** en `src/config/multer.js` (separada
de los routers): define destino, nombres, tipos aceptados, tamaño máximo y el
mapeo de errores.

- **Tipos permitidos**: PDF, JPG, PNG.
- **Tamaño máximo**: 5 MB por archivo.
- **Carpeta de subidas**: `uploads/`, organizada en subcarpetas por tipo
  (`user-documents/`, `licenses/`, `delivery-proofs/`). Está en `.gitignore`:
  **los archivos subidos NO se suben al repo** (solo viajan los metadatos en la DB).
  En testing se usa `uploads-test/` (descartable).

### Metadatos que se guardan

`originalName`, `filename` (nombre generado), `path`, `mimetype`, `size`,
`documentType` y `uploadedAt`.

### Endpoints

| Método | Ruta | Campo archivo | Campos extra | Descripción |
| ------ | ---- | ------------- | ------------ | ----------- |
| POST | `/api/users/:id/documents` | `file` | `documentType` (`user_document` \| `driver_license` \| `delivery_proof`) | Sube un documento y lo asocia al usuario |
| POST | `/api/orders/:id/receipts` | `file` | — | Sube un comprobante y lo asocia al pedido |
| POST | `/api/deliveries/:id/receipts` | `file` | — | Sube un comprobante y lo asocia a la entrega |

Ejemplo:

```bash
curl -X POST http://localhost:8080/api/users/<userId>/documents \
  -F "documentType=user_document" \
  -F "file=@/ruta/a/mi-documento.pdf"
```

### Validaciones y errores

Conectadas al **sistema de errores centralizado** (mismo formato del M3):
`FILE_REQUIRED` (falta el archivo), `INVALID_FILE_TYPE` (tipo no permitido),
`FILE_TOO_LARGE` (supera 5 MB), `INVALID_DOCUMENT_TYPE`, y `404` si la entidad
(usuario/pedido/entrega) no existe. La existencia de la entidad se valida **antes**
de guardar el archivo, así no queda basura en el disco.

El **logger** registra los eventos relevantes (carga exitosa, intento de tipo no
permitido, error de guardado, comprobante asociado), y los endpoints están
**documentados en Swagger** como `multipart/form-data`.

---

## Testing (M6)

Tests **funcionales** de los endpoints principales con **Mocha** (organiza y
ejecuta), **Chai** (asserts) y **Supertest** (peticiones HTTP). La app de Express
está separada del arranque del servidor (`createApp()` en `src/app.js`), así que
los tests la importan **sin abrir un puerto**.

### Herramientas y cómo ejecutar

```bash
npm install     # instala también las dependencias de testing (devDependencies)
npm test        # ejecuta toda la suite con Mocha
```

### Entorno de testing

- Se ejecuta con `NODE_ENV=test` (lo fuerza `test/setup.js`): el logger queda
  silenciado y **no** escribe archivos de log.
- **Base de datos separada y descartable**: por defecto se levanta una MongoDB
  **en memoria** (`mongodb-memory-server`), así los tests **no tocan datos reales**
  y cada corrida arranca limpia. No requiere configurar nada.
- Alternativa: si definís `MONGODB_URI_TEST`, los tests usan esa base de testing
  separada en lugar de la de memoria.
- **Datos controlados y repetibles**: cada test crea lo que necesita (ej. un
  usuario válido antes de un pedido) o usa el módulo de mocks. **Después de cada
  test** se vacían todas las colecciones (estrategia de limpieza en `test/setup.js`),
  para que ningún test dependa del estado de otro.

### Qué se cubre

Los tests viven en `test/` y validan **status HTTP + estructura del body** en cada caso:

| Archivo                   | Cubre |
| ------------------------- | ----- |
| `test/users.test.js`      | Listar/crear usuarios; errores: datos incompletos (400), email duplicado (409), usuario inexistente (404) |
| `test/orders.test.js`     | Crear pedido con datos válidos (total calculado), consultar por id, actualizar estado; errores: datos incompletos (400), customer inexistente (404), pedido inexistente (404), estado inválido (400) |
| `test/mocks.test.js`      | Preview sin guardar, seed, `generateData`; errores: cantidad inválida (400), colección inválida (400) |
| `test/docs-logger.test.js`| Endpoint del logger, ruta de Swagger `/api/docs`, y ruta inexistente (404) |
| `test/files.test.js`      | Carga de documento (éxito); errores: falta el archivo (400), tipo de documento inválido (400), tipo de archivo no permitido (400), usuario/pedido inexistente (404) |
| `test/health-pagination.test.js` | Health check (200, sin datos sensibles) y paginación de listados (límite + metadatos) |

Los casos de error validan el **mismo formato** que define el módulo de errores
(`{ status: 'error', error: { code, message } }`), y hay coherencia con Swagger:
comportamientos documentados como el **404 ante recurso/ruta inexistente** tienen
su test.

---

## ¿Por qué separar la lógica entre Service y Repository?

Esta fue la decisión de diseño central de la refactorización.

El **Repository** es el único que sabe que por debajo hay Mongoose y MongoDB.
Su responsabilidad es *buscar y guardar datos*, y encapsular ese acceso: aplica
proyecciones por defecto (por ejemplo, el `users.repository` **nunca** devuelve
el `password` ni el `__v`) y expone una API de datos estable. No es un simple
"pasamanos" que hace `return Model.find()`: si mañana cambiamos MongoDB por otro
motor o agregamos una caché con Redis, solo se toca esta capa y el resto de la
aplicación ni se entera.

El **Service** concentra la *lógica de negocio*, que es lo que hace que ShipNow
sea una empresa de logística y no cualquier otra cosa. Acá viven las reglas del
dominio: derivar el estado de un producto según su stock
(`stock > 0 → available`), impedir que se cree un usuario con un email duplicado,
validar que el rol sea uno de los permitidos, o exponer solo los productos con
stock disponibles para enviar. El Service **no conoce Express** (no recibe
`req`/`res`) ni **conoce Mongoose** (le habla al Repository), por lo que se puede
testear de forma aislada, sin levantar un servidor ni una base de datos.

En resumen: **el Repository responde "cómo accedo a los datos" y el Service
responde "qué reglas del negocio aplico sobre esos datos".** Mantenerlos
separados respeta el Principio de Responsabilidad Única, hace el código más fácil
de testear y permite que cada capa cambie por su propia razón sin arrastrar a las
demás. El **Controller**, por su parte, solo traduce entre HTTP y el negocio: lee
la petición, llama al Service y devuelve la respuesta con el status adecuado.
