# I Love Salads Backend

API REST para el registro de usuarios y la gestión de pedidos de comida de **I Love Salads**. El backend está construido con Node.js, Express y MongoDB, e incluye autenticación mediante JSON Web Tokens (JWT), validación de datos y control de acceso por roles.

## Tecnologías

- Node.js
- Express 5
- MongoDB y Mongoose
- JWT para autenticación
- bcryptjs para proteger las contraseñas
- Joi y Celebrate para validar las peticiones
- Winston y express-winston para registrar solicitudes y errores

## Requisitos

- Node.js 18 o superior
- npm
- MongoDB ejecutándose localmente en el puerto `27017`

La aplicación se conecta por defecto a la base de datos `ilovesalads`:

```text
mongodb://localhost:27017/ilovesalads
```

## Instalación

```bash
git clone https://github.com/CarMa90/i-love-salads-backend.git
cd i-love-salads-backend
npm install
```

## Configuración

En desarrollo, la aplicación utiliza el secreto `dev-secret` para firmar los tokens. En producción debes definir las variables de entorno:

```bash
export NODE_ENV=production
export JWT_SECRET=tu-secreto-seguro
export PORT=3000
```

`PORT` es opcional y, si no se define, la API se inicia en el puerto `3000`.

## Ejecución

Modo desarrollo, con reinicio automático:

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

La API estará disponible en `http://localhost:3000`.

## Autenticación y roles

Las rutas protegidas requieren el siguiente encabezado:

```http
Authorization: Bearer <token>
```

Los roles disponibles son:

| Rol          | Permisos principales                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `client`     | Consultar su perfil, crear pedidos, consultar sus pedidos y aceptar la cancelación de un pedido |
| `restaurant` | Consultar pedidos y actualizar su estado                                                        |
| `admin`      | Consultar usuarios y pedidos, actualizar estados y cancelar pedidos                             |

## Endpoints

### Autenticación

#### Crear una cuenta

`POST /signup`

```json
{
  "name": "Ana Pérez",
  "email": "ana@example.com",
  "password": "Password1!",
  "mobile": {
    "countryCode": "+34",
    "phone": "612345678"
  }
}
```

La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial. El rol predeterminado es `client`.

#### Iniciar sesión

`POST /signin`

```json
{
  "email": "ana@example.com",
  "password": "Password1!"
}
```

Respuesta exitosa:

```json
{
  "token": "<jwt>"
}
```

### Usuarios

Todas las rutas de esta sección requieren autenticación.

| Método | Ruta        | Acceso                        | Descripción                           |
| ------ | ----------- | ----------------------------- | ------------------------------------- |
| `GET`  | `/users/me` | Cualquier usuario autenticado | Devuelve el perfil del usuario actual |
| `GET`  | `/users`    | Cualquier usuario autenticado | Devuelve la lista de usuarios         |

### Pedidos

Todas las rutas de esta sección requieren autenticación.

| Método | Ruta                                 | Acceso                        | Descripción                                                                    |
| ------ | ------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------ |
| `GET`  | `/orders`                            | Cualquier usuario autenticado | Los clientes reciben sus pedidos; administradores y restaurantes reciben todos |
| `POST` | `/orders`                            | Cualquier usuario autenticado | Crea un pedido para el usuario actual                                          |
| `PUT`  | `/orders/:orderId/status`            | `admin`, `restaurant`         | Actualiza el estado del pedido                                                 |
| `PUT`  | `/orders/:orderId/cancel`            | `admin`                       | Cancela un pedido con un mensaje                                               |
| `PUT`  | `/orders/:orderId/cancel/acceptance` | Cualquier usuario autenticado | El cliente acepta la cancelación de su pedido                                  |

Para crear un pedido:

```json
{
  "products": [
    {
      "_id": "salad-001",
      "name": "Ensalada César",
      "price": 12.5,
      "quantity": 2
    }
  ]
}
```

El backend calcula automáticamente `totalAmount`, asigna un `orderNumber` consecutivo y establece inicialmente el estado `Enviado`.

Para actualizar el estado:

```json
{
  "status": "Aceptado"
}
```

Los estados permitidos son `Enviado`, `Aceptado`, `Listo` y `Entregado`. Para cancelar un pedido como administrador:

```json
{
  "message": "Producto no disponible"
}
```

## Respuestas y errores

Las respuestas de recursos se envuelven normalmente en una propiedad `data`. Por ejemplo:

```json
{
  "data": {}
}
```

Los errores devuelven una propiedad `message` y un código HTTP apropiado, entre ellos:

- `400` para datos inválidos.
- `401` cuando falta un token o no es válido.
- `403` cuando el usuario no tiene permisos suficientes.
- `404` cuando el recurso no existe.
- `409` cuando se intenta registrar un email ya existente.

## Linting

Para ejecutar ESLint:

```bash
npm run lint
```

Actualmente el proyecto no incluye pruebas automatizadas configuradas en `npm test`.
