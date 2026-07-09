# Sistema de Gestión de Inventario - Ferretería

Sistema completo de gestión de inventario especializado para ferreterías con control de stock, ventas, y alertas.

## Características

- ✅ Gestión de productos con categorías, marcas, proveedores
- ✅ Multi-unidad de medida (piezas, metros, kilogramos, litros)
- ✅ Control de stock con mínimo/máximo y alertas automáticas
- ✅ Sistema de ventas con control de concurrencia
- ✅ Historial de movimientos de inventario
- ✅ Ubicación física de productos (pasillo, estante, gaveta)
- ✅ Costeo FIFO o Promedio Ponderado
- ✅ Interfaz web moderna y responsiva

## Stack Tecnológico

**Backend:**
- Node.js + TypeScript
- Fastify (framework web)
- Prisma ORM
- SQLite (base de datos local)

**Frontend:**
- React 18
- Vite
- CSS nativo (sin frameworks)

## Instalación

### Requisitos Previos

- Node.js 18+ (https://nodejs.org/)
- npm o yarn

### Pasos de Instalación

1. **Instalar dependencias del backend:**
```bash
cd backend
npm install
```

2. **Configurar base de datos:**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

3. **Iniciar el backend:**
```bash
npm run dev
```
El backend se ejecutará en `http://localhost:3001`

4. **Instalar dependencias del frontend (en otra terminal):**
```bash
cd frontend
npm install
```

5. **Iniciar el frontend:**
```bash
npm run dev
```
El frontend se ejecutará en `http://localhost:3000`

## Credenciales de Acceso

- **Usuario:** `admin`
- **Contraseña:** `admin123`

## Uso

### Dashboard
Vista general con estadísticas del sistema:
- Total de productos
- Productos con stock bajo
- Ventas del día
- Valor total del inventario

### Productos
- **Listado:** Ver todos los productos con stock y precios
- **Búsqueda:** Buscar por nombre, código interno o código de barras
- **Crear:** Agregar nuevos productos con todos los atributos
- **Editar:** Modificar productos existentes
- **Eliminar:** Desactivar productos (soft delete)

### Ventas
- **Seleccionar productos:** Buscar y agregar productos al carrito
- **Control de stock:** No permite vender sin stock suficiente
- **Cliente opcional:** Registrar nombre e identificación del cliente
- **Métodos de pago:** Efectivo, Tarjeta, Transferencia, Crédito
- **Concurrencia:** Control de bloqueo para evitar ventas simultáneas del mismo producto

### Inventario
- **Stock Actual:** Ver stock por sucursal
- **Alertas:** Ver productos con stock bajo o sin stock
- **Movimientos:** Historial completo de todos los movimientos de inventario

## API Endpoints

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener producto
- `GET /api/productos/search?q=` - Buscar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Ventas
- `GET /api/ventas` - Listar ventas
- `GET /api/ventas/:id` - Obtener venta
- `POST /api/ventas` - Crear venta
- `POST /api/ventas/:id/anular` - Anular venta

### Inventario
- `GET /api/inventario/stock` - Stock actual
- `GET /api/inventario/alertas` - Alertas de stock
- `GET /api/inventario/movimientos` - Historial de movimientos
- `POST /api/inventario/movimientos` - Crear movimiento manual

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Verificar token

### Maestros
- `GET /api/categorias` - Listar categorías
- `GET /api/marcas` - Listar marcas
- `GET /api/proveedores` - Listar proveedores
- `GET /api/unidades` - Listar unidades de medida
- `GET /api/sucursales` - Listar sucursales

## Datos de Ejemplo

El sistema incluye datos de ejemplo:
- 1 usuario (admin)
- 1 sucursal
- 6 categorías
- 3 marcas
- 2 proveedores
- 5 unidades de medida
- 5 productos de ejemplo
- 2 ubicaciones

## Estructura del Proyecto

```
inventario/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   └── seed.ts            # Datos de ejemplo
│   ├── src/
│   │   ├── routes/            # Endpoints API
│   │   │   ├── productos.ts
│   │   │   ├── ventas.ts
│   │   │   ├── auth.ts
│   │   │   └── inventario.ts
│   │   └── server.ts          # Servidor Fastify
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── Login.jsx
│   │   │   ├── Productos.jsx
│   │   │   ├── Ventas.jsx
│   │   │   └── Inventario.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Control de Concurrencia

El sistema implementa control de concurrencia usando transacciones de base de datos con bloqueo pesimista (pessimistic locking) para evitar ventas simultáneas del mismo producto sin stock suficiente.

## Desarrollo

### Backend
```bash
cd backend
npm run dev          # Modo desarrollo con hot reload
npm run build        # Compilar TypeScript
npm start            # Ejecutar producción
```

### Frontend
```bash
cd frontend
npm run dev          # Modo desarrollo
npm run build        # Compilar para producción
npm run preview       # Previsualizar producción
```

### Base de Datos
```bash
cd backend
npm run prisma:studio    # Interfaz visual de la BD
npm run prisma:migrate    # Crear migración
npm run prisma:generate   # Generar cliente Prisma
npm run seed             # Cargar datos de ejemplo
```

## Troubleshooting

### Error "Cannot find module 'bcrypt'"
Ejecutar `npm install` en el directorio backend.

### Error de conexión a la base de datos
Asegurarse de haber ejecutado `npm run prisma:migrate` y `npm run seed`.

### Puerto en uso
Cambiar el puerto en `.env` (backend) o `vite.config.js` (frontend).

## Licencia

MIT

## Soporte

Para reportar issues o sugerencias, contactar al desarrollador.
