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
│   └── database.js       # conexión centralizada a MongoDB
├── constants/
│   └── index.js          # roles, estados y prioridades (Object.freeze) — sin strings mágicos
├── controllers/
│   ├── products.controller.js
│   ├── users.controller.js
│   └── mocks.controller.js
├── middlewares/
│   └── errorHandler.js   # manejo centralizado de errores
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
│   └── mocks.router.js
├── services/
│   ├── products.service.js
│   ├── users.service.js
│   └── mocks.service.js  # generación + carga controlada, respeta relaciones
├── utils/
│   └── AppError.js
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
