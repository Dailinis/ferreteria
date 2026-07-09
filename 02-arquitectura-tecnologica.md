# Arquitectura Tecnológica - Sistema de Gestión de Inventario Ferretería

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Móvil App   │  │   Desktop    │      │
│  │  (React/Vue) │  │ (React Native)│  │ (Electron)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│                    (Nginx / Traefik)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST API / GraphQL                                   │  │
│  │  (Node.js + Express / FastAPI / .NET Core)           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                                 │  │
│  │  - Servicios de Inventario                           │  │
│  │  - Servicios de Ventas                                │  │
│  │  - Servicios de Compras                               │  │
│  │  - Servicios de Reportes                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Data Access Layer (ORM)                             │  │
│  │  (Prisma / TypeORM / Entity Framework / SQLAlchemy)  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
│              PostgreSQL / MySQL / SQL Server                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CACHE                                    │
│                    Redis / Memcached                        │
└─────────────────────────────────────────────────────────────┘
```

## Opción 1: Stack Moderno (Recomendado para Nube)

### Frontend
- **Framework**: React 18+ con TypeScript
- **UI Components**: shadcn/ui + TailwindCSS
- **State Management**: Zustand o React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify (más rápido que Express) o Express
- **Lenguaje**: TypeScript
- **ORM**: Prisma (type-safe, excelente DX)
- **Validación**: Zod
- **Autenticación**: JWT + bcrypt
- **Documentación API**: Swagger/OpenAPI

### Base de Datos
- **Motor**: PostgreSQL 15+
- **Razón**: Mejor soporte para JSON, transacciones ACID, tipos de datos precisos

### Cache
- **Redis**: Para sesiones, cache de consultas frecuentes, locks distribuidos

### Infraestructura Nube
- **Hosting**: Vercel (Frontend) + Railway/Render (Backend) + Supabase/Neon (DB)
- **CDN**: Cloudflare
- **Monitoreo**: Sentry (errores), LogRocket (sesiones)

---

## Opción 2: Stack .NET (Recomendado para Windows Local)

### Frontend
- **Framework**: Blazor WebAssembly o React
- **UI Components**: MudBlazor (si usa Blazor) o shadcn/ui (si usa React)

### Backend
- **Framework**: .NET 8 ASP.NET Core Web API
- **ORM**: Entity Framework Core
- **Lenguaje**: C#
- **Validación**: FluentValidation
- **Autenticación**: ASP.NET Core Identity + JWT

### Base de Datos
- **Motor**: SQL Server Express (local) o Azure SQL (nube)
- **Razón**: Integración nativa con .NET, excelente rendimiento

### Infraestructura Local
- **Ejecución**: IIS Express o Kestrel
- **Despliegue**: Docker Desktop (opcional)

---

## Opción 3: Stack Python (Recomendado para Prototipado Rápido)

### Frontend
- **Framework**: Vue.js 3 con TypeScript
- **UI Components**: Element Plus o PrimeVue

### Backend
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0
- **Lenguaje**: Python 3.11+
- **Validación**: Pydantic v2
- **Autenticación**: FastAPI Security + JWT

### Base de Datos
- **Motor**: PostgreSQL o SQLite (para desarrollo)

---

## Estructura de Proyecto (Stack Node.js + Prisma)

```
inventario-system/
├── frontend/                    # React + TypeScript
│   ├── src/
│   │   ├── components/          # Componentes UI reutilizables
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── sales/
│   │   │   └── reports/
│   │   ├── pages/               # Páginas principales
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API client
│   │   ├── stores/              # State management (Zustand)
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utilidades
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                     # Node.js + Fastify + TypeScript
│   ├── src/
│   │   ├── modules/             # Módulos por dominio
│   │   │   ├── products/
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── products.repository.ts
│   │   │   │   └── products.routes.ts
│   │   │   ├── inventory/
│   │   │   │   ├── movements.controller.ts
│   │   │   │   ├── movements.service.ts
│   │   │   │   └── movements.routes.ts
│   │   │   ├── sales/
│   │   │   │   ├── sales.controller.ts
│   │   │   │   ├── sales.service.ts
│   │   │   │   └── sales.routes.ts
│   │   │   ├── purchases/
│   │   │   ├── reports/
│   │   │   └── alerts/
│   │   ├── shared/
│   │   │   ├── database/        # Prisma client
│   │   │   ├── middleware/      # Auth, error handling
│   │   │   ├── validators/      # Zod schemas
│   │   │   └── utils/           # Utilidades compartidas
│   │   ├── app.ts               # App entry point
│   │   └── server.ts            # Server setup
│   ├── prisma/
│   │   ├── schema.prisma        # Schema de BD
│   │   └── migrations/          # Migraciones
│   ├── package.json
│   └── tsconfig.json
│
└── docker-compose.yml           # Para despliegue local
```

## Endpoints Principales API (REST)

```
# Productos
GET    /api/products              - Listar productos (paginado, filtros)
GET    /api/products/:id          - Obtener detalle producto
POST   /api/products              - Crear producto
PUT    /api/products/:id          - Actualizar producto
DELETE /api/products/:id          - Eliminar producto (soft delete)
GET    /api/products/search?q=    - Búsqueda por código/nombre

# Inventario
GET    /api/inventory/stock       - Stock actual por sucursal
GET    /api/inventory/alerts      - Alertas de stock bajo
POST   /api/inventory/movements   - Registrar movimiento
GET    /api/inventory/movements   - Historial de movimientos
GET    /api/inventory/locations  - Ubicaciones de productos

# Ventas
POST   /api/sales                 - Crear venta
GET    /api/sales/:id             - Obtener detalle venta
GET    /api/sales                 - Listar ventas
POST   /api/sales/:id/void        - Anular venta

# Compras
POST   /api/purchases             - Crear compra
GET    /api/purchases/:id         - Obtener detalle compra
GET    /api/purchases             - Listar compras
POST   /api/purchases/:id/receive - Recibir mercancía

# Reportes
GET    /api/reports/inventory-value    - Valoración inventario
GET    /api/reports/slow-moving        - Productos baja rotación
GET    /api/reports/top-sales          - Top productos vendidos
GET    /api/reports/movements          - Reporte movimientos

# Maestros
GET    /api/categories             - Listar categorías
GET    /api/brands                  - Listar marcas
GET    /api/suppliers               - Listar proveedores
GET    /api/units                   - Listar unidades medida
GET    /api/locations               - Listar ubicaciones
GET    /api/branches                - Listar sucursales
```

## Estrategia de Caching con Redis

```typescript
// Cache de productos frecuentes
const CACHE_KEYS = {
  PRODUCTS_LIST: 'products:list',
  PRODUCT_DETAIL: (id: string) => `product:${id}`,
  STOCK_ALERTS: 'inventory:alerts',
  TOP_SALES: 'reports:top-sales:daily'
};

// TTL recomendados
const CACHE_TTL = {
  PRODUCTS_LIST: 300,      // 5 minutos
  PRODUCT_DETAIL: 600,     // 10 minutos
  STOCK_ALERTS: 60,        // 1 minuto
  REPORTS: 3600            // 1 hora
};
```

## Seguridad

### Autenticación
- JWT tokens con refresh tokens
- Roles: ADMIN, GERENTE, CAJERO, ALMACEN
- Password hashing con bcrypt (cost factor 12)

### Autorización
- Middleware por rol en cada endpoint
- RBAC (Role-Based Access Control)

### Validaciones
- Input validation con Zod en backend
- Sanitización de datos
- SQL injection prevention (ORM parameterized queries)

## Performance

### Índices de Base de Datos
- Ver archivo `01-modelo-base-datos.md` para índices recomendados

### Optimizaciones
- Connection pooling (Prisma)
- Query batching (dataloaders)
- Pagination para listados grandes
- Select fields específicos (no SELECT *)

### Monitoreo
- Logs estructurados (Pino)
- Métricas de API (response time, error rate)
- Alertas por email/webhook

## Escalabilidad

### Horizontal Scaling
- Backend: Stateless, puede escalar con load balancer
- Database: Read replicas para consultas de reportes
- Cache: Redis Cluster

### Vertical Scaling
- Aumentar recursos de servidor según carga
- Optimizar queries con EXPLAIN ANALYZE

## Backup y Recuperación

### Estrategia de Backup
- Backup diario automático de base de datos
- Retención: 7 días diarios + 4 semanas + 12 meses
- Backup de Redis (RDB snapshots)

### Recuperación
- Point-in-time recovery (PostgreSQL)
- Restore tests mensuales

## Recomendación Final

**Para computadora local (Windows):**
- Backend: .NET 8 + SQL Server Express
- Frontend: Blazor WebAssembly o React
- Ventajas: Integración nativa Windows, excelente performance local

**Para nube:**
- Backend: Node.js + Fastify + PostgreSQL
- Frontend: React + Vite
- Hosting: Vercel + Railway + Supabase
- Ventajas: Stack moderno, costos bajos, escalabilidad
