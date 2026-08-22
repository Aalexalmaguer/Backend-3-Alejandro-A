# ShipNow API

API base de la plataforma de logística **ShipNow**, refactorizada a una
**arquitectura profesional por capas** (Controller → Service → Repository) con
un sistema de **configuración de entorno validada** y **constantes de dominio**.

Este repositorio es la base del proyecto para Backend III y se irá ampliando en
las próximas entregas (mocking, manejo de errores, logger, documentación,
testing y Docker).

> Estado actual: refactorización de las entidades **Products** y **Users**.

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
│   └── index.js          # roles y estados (Object.freeze) — sin strings mágicos
├── controllers/
│   ├── products.controller.js
│   └── users.controller.js
├── middlewares/
│   └── errorHandler.js   # manejo centralizado de errores
├── models/
│   ├── product.model.js  # solo el esquema de Mongoose
│   └── user.model.js
├── repositories/
│   ├── products.repository.js
│   └── users.repository.js
├── routes/
│   ├── index.js
│   ├── products.router.js
│   └── users.router.js
├── services/
│   ├── products.service.js
│   └── users.service.js
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
