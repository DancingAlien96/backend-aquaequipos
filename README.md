# 🚀 Backend AquaEquipos

API REST para el e-commerce de AquaEquipos, construido con Express, TypeScript y SQLite.

## ✨ Características Principales

### 🛒 E-commerce API
- **WooCommerce Integration** - Proxy de productos, categorías y órdenes
- **Sistema de carrito** persistente con SQLite
- **Sistema de favoritos** con base de datos
- **Gestión de usuarios** con validación por Firebase UID

### 💳 Pasarelas de Pago
- **TiloPay Integration** - Procesamiento de pagos para Guatemala
- **Cash on Delivery (COD)** - Pago contra entrega
- Consulta de transacciones
- Webhooks ready

### 🗄️ Base de Datos
- **SQLite con sql.js** (JavaScript/WASM)
- Sin compilación nativa
- Tablas: `cart`, `favorites`
- Migración automática en inicio

### 🔒 Seguridad
- **Helmet** para headers de seguridad
- **CORS** configurado
- **Compression** para optimización
- Variables de entorno para credenciales

## �️ Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **Language:** TypeScript 5
- **Database:** sql.js (SQLite WASM)
- **WooCommerce:** REST API v3
- **Payment:** TiloPay API v1

## 📁 Estructura del Proyecto

```
backend-aquaequipos/
├── src/
│   ├── index.ts              # Entry point del servidor
│   ├── config/
│   │   ├── woocommerce.ts   # Cliente WooCommerce
│   │   └── tilopay.ts       # Cliente TiloPay
│   ├── db/
│   │   └── sqlite.ts        # Configuración SQLite
│   ├── routes/
│   │   ├── products.ts      # Productos de WooCommerce
│   │   ├── categories.ts    # Categorías
│   │   ├── orders.ts        # Órdenes
│   │   ├── cart.ts          # Carrito de compras
│   │   ├── favorites.ts     # Favoritos
│   │   └── tilopay.ts       # Pagos con TiloPay
│   └── types/
│       └── index.ts         # TypeScript types
├── .env                     # Variables de entorno (no en repo)
├── .env.example             # Template de variables
├── .gitignore
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18.x o superior
- npm o yarn
- Credenciales de WooCommerce
- Credenciales de TiloPay (opcional)

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/DancingAlien96/backend-aquaequipos.git
cd backend-aquaequipos
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

Crear archivo `.env` con las siguientes variables:

```env
# Puerto del servidor
PORT=4000

# WooCommerce
WOOCOMMERCE_URL=https://tu-tienda.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxx

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# TiloPay (opcional)
TILOPAY_API_URL=https://app.tilopay.com/api/v1
TILOPAY_API_USER=tu_usuario
TILOPAY_API_PASSWORD=tu_password
TILOPAY_API_KEY=tu_api_key
```

### 🔑 Obtener Credenciales de WooCommerce

1. Ir a tu panel de WordPress: `https://aquaequipos.com/wp-admin`
2. Navegar a: **WooCommerce** → **Configuración** → **Avanzado** → **REST API**
3. Hacer clic en **Añadir clave**
4. Completar:
   - **Descripción**: Backend AquaEquipos
   - **Usuario**: Seleccionar un administrador
   - **Permisos**: Lectura/Escritura
5. Copiar el **Consumer Key** y **Consumer Secret** generados
6. Pegar en el archivo `.env`

## 🏃 Desarrollo

Iniciar servidor de desarrollo con hot-reload:
```bash
npm run dev
```

El servidor estará disponible en [http://localhost:4000](http://localhost:4000)

## 🏗️ Build

Compilar TypeScript a JavaScript:
```bash
npm run build
```

Iniciar servidor de producción:
```bash
npm start
```

## 📡 Endpoints de la API

### Health Check
```
GET /health
```
Verifica que el servidor está funcionando.

**Respuesta:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Productos

#### Listar Productos
```
GET /api/products
```

**Query Parameters:**
- `page` (number): Número de página (default: 1)
- `per_page` (number): Productos por página (default: 12)
- `search` (string): Búsqueda por nombre
- `category` (string): Filtrar por categoría ID
- `featured` (boolean): Solo productos destacados
- `on_sale` (boolean): Solo productos en oferta

**Respuesta:**
```json
{
  "products": [...],
  "total": 50,
  "totalPages": 5
}
```

#### Obtener Producto por Slug
```
GET /api/products/:slug
```

**Ejemplo:**
```
GET /api/products/bomba-para-pozo-aquax-st18
```

#### Obtener Producto por ID
```
GET /api/products/id/:id
```

**Ejemplo:**
```
GET /api/products/id/123
```

### Categorías

#### Listar Categorías
```
GET /api/categories
```

**Query Parameters:**
- `page` (number): Número de página
- `per_page` (number): Categorías por página (default: 100)
- `parent` (number): Filtrar por categoría padre

**Respuesta:**
```json
{
  "categories": [...],
  "total": 15,
  "totalPages": 1
}
```

#### Obtener Categoría por ID
```
GET /api/categories/:id
```

### Órdenes

#### Crear Orden
```
POST /api/orders
```

**Body:**
```json
{
  "billing": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "address_1": "Calle Principal 123",
    "city": "Guatemala",
    "state": "Guatemala",
    "postcode": "01001",
    "country": "GT",
    "email": "juan@example.com",
    "phone": "12345678"
  },
  "shipping": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "address_1": "Calle Principal 123",
    "city": "Guatemala",
    "state": "Guatemala",
    "postcode": "01001",
    "country": "GT"
  },
  "line_items": [
    {
      "product_id": 123,
      "quantity": 2
    }
  ]
}
```

#### Obtener Orden
```
GET /api/orders/:id
```

### Carrito (requiere header `x-user-id`)

#### Obtener carrito del usuario
```
GET /api/cart
Headers: x-user-id: FIREBASE_UID
```

#### Agregar producto al carrito
```
POST /api/cart
Headers: x-user-id: FIREBASE_UID
Body: {
  "product_id": 123,
  "quantity": 1,
  "product_data": { ...producto completo }
}
```

#### Actualizar cantidad
```
PUT /api/cart/:productId
Headers: x-user-id: FIREBASE_UID
Body: { "quantity": 3 }
```

#### Eliminar producto
```
DELETE /api/cart/:productId
Headers: x-user-id: FIREBASE_UID
```

#### Vaciar carrito
```
DELETE /api/cart
Headers: x-user-id: FIREBASE_UID
```

### Favoritos (requiere header `x-user-id`)

#### Obtener favoritos del usuario
```
GET /api/favorites
Headers: x-user-id: FIREBASE_UID
```

#### Agregar a favoritos
```
POST /api/favorites
Headers: x-user-id: FIREBASE_UID
Body: {
  "product_id": 123,
  "title": "Producto XYZ",
  "price": "299.99",
  "thumbnail": "https://...",
  ...
}
```

#### Eliminar de favoritos
```
DELETE /api/favorites/:productId
Headers: x-user-id: FIREBASE_UID
```

### TiloPay (Pasarela de pago)

#### Crear orden de pago
```
POST /api/tilopay/create-payment
Body: {
  "amount": 500.00,
  "currency": "GTQ",
  "orderNumber": "ORDER-123456",
  "billing": { ... },
  "shipping": { ... },
  "redirectUrl": "https://tu-sitio.com/pago-completado"
}
```

**Respuesta:**
```json
{
  "success": true,
  "paymentUrl": "https://app.tilopay.com/payment/...",
  "type": "redirect"
}
```

#### Consultar transacción
```
GET /api/tilopay/consult/:orderNumber
```

## 🗄️ Base de Datos SQLite

### Tabla: cart
```sql
CREATE TABLE cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  product_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
)
```

### Tabla: favorites
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT,
  price TEXT,
  regular_price TEXT,
  sale_price TEXT,
  on_sale INTEGER DEFAULT 0,
  stock_status TEXT,
  thumbnail TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
)
```

## 🚀 Scripts Disponibles

```bash
npm run dev      # Desarrollo con nodemon y hot-reload
npm run build    # Compilar TypeScript a JavaScript
npm start        # Producción (requiere build previo)
```

## 🔐 Autenticación

El backend usa Firebase UID para identificar usuarios:
- Header requerido: `x-user-id: FIREBASE_UID`
- Se valida en endpoints de carrito y favoritos
- Los datos se asocian al UID del usuario

## 🌐 Integración con Frontend

Este backend está diseñado para trabajar con el [Frontend de AquaEquipos](https://github.com/DancingAlien96/Frontend_aquaequipos):

- Puerto default: `4000`
- CORS configurado para `localhost:3000` y `localhost:3001`
- Headers esperados: `x-user-id` para endpoints protegidos

## 🔒 Seguridad

- **Helmet.js**: Headers de seguridad HTTP
- **CORS**: Configurado para orígenes específicos
- **Variables de entorno**: Credenciales en `.env` (no en repo)
- **Validación de usuarios**: Firebase UID en headers
- **TiloPay token caching**: Tokens con expiración de 23 horas

## 🧪 Testing

Para probar los endpoints:

### Con Thunder Client (VS Code)
1. Instalar extensión Thunder Client
2. Crear request GET a `http://localhost:4000/api/products`
3. Para endpoints protegidos, agregar header: `x-user-id: test-uid-123`

### Con cURL
```bash
# Listar productos
curl http://localhost:4000/api/products?per_page=5

# Obtener carrito (requiere user-id)
curl -H "x-user-id: test-uid-123" http://localhost:4000/api/cart
```

## 🐛 Debugging

El servidor muestra logs detallados en desarrollo:
```
🚀 Server running on port 4000
📦 Environment: development
🔗 WooCommerce URL: https://aquaequipos.com
✅ SQLite database initialized
🗄️  Database tables: cart, favorites
```

Los errores de WooCommerce y TiloPay se registran con detalles completos.

## 📄 Licencia

© 2026 AquaEquipos - Todos los derechos reservados

---

**Desarrollado con ❤️ por el equipo de AquaEquipos**
