# Modelo de Base de Datos - Sistema de Gestión de Inventario Ferretería

## Diagrama Entidad-Relación

### Tablas Principales

#### 1. `categorias`
Clasificación principal de productos (Herramientas, Electricidad, Plomería, etc.)

```sql
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. `marcas`
Marcas de productos

```sql
CREATE TABLE marcas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    pais_origen VARCHAR(50),
    contacto VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. `proveedores`
Información de proveedores

```sql
CREATE TABLE proveedores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    razon_social VARCHAR(200) NOT NULL,
    ruc_nit VARCHAR(50) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(100),
    contacto_principal VARCHAR(100),
    credito_dias INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 4. `unidades_medida`
Unidades de medida para productos

```sql
CREATE TABLE unidades_medida (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'pieza', 'longitud', 'peso', 'volumen'
    factor_conversion DECIMAL(10,4) DEFAULT 1.0, -- Factor para convertir a unidad base
    unidad_base_id INT NULL, -- Referencia a unidad base (ej: caja -> pieza)
    FOREIGN KEY (unidad_base_id) REFERENCES unidades_medida(id)
);
```

#### 5. `productos`
Tabla principal de productos

```sql
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_interno VARCHAR(50) NOT NULL UNIQUE,
    codigo_barra VARCHAR(100) UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria_id INT NOT NULL,
    marca_id INT,
    proveedor_principal_id INT,
    unidad_medida_id INT NOT NULL,
    material VARCHAR(100),
    medida VARCHAR(50), -- ej: "1/2 pulgada", "10 mm"
    costo_promedio DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_actual DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_maximo DECIMAL(10,2) NOT NULL DEFAULT 0,
    punto_reorden DECIMAL(10,2) NOT NULL DEFAULT 0,
    metodo_costeo ENUM('FIFO', 'PROMEDIO') DEFAULT 'PROMEDIO',
    activo BOOLEAN DEFAULT TRUE,
    imagen_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (marca_id) REFERENCES marcas(id),
    FOREIGN KEY (proveedor_principal_id) REFERENCES proveedores(id),
    FOREIGN KEY (unidad_medida_id) REFERENCES unidades_medida(id),
    INDEX idx_codigo_interno (codigo_interno),
    INDEX idx_codigo_barra (codigo_barra),
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (categoria_id),
    INDEX idx_stock_bajo (stock_actual, stock_minimo)
);
```

#### 6. `ubicaciones`
Ubicación física en tienda (pasillo, estante, gaveta)

```sql
CREATE TABLE ubicaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    pasillo VARCHAR(10),
    estante VARCHAR(10),
    gaveta VARCHAR(10),
    descripcion VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. `producto_ubicaciones`
Relación muchos a muchos entre productos y ubicaciones

```sql
CREATE TABLE producto_ubicaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
    UNIQUE KEY unique_producto_ubicacion (producto_id, ubicacion_id)
);
```

#### 8. `sucursales`
Sucursales o bodegas del negocio

```sql
CREATE TABLE sucursales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(50),
    es_bodega BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. `stock_sucursal`
Stock por sucursal/bodega

```sql
CREATE TABLE stock_sucursal (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    sucursal_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    UNIQUE KEY unique_producto_sucursal (producto_id, sucursal_id)
);
```

#### 10. `tipos_movimiento`
Tipos de movimientos de inventario

```sql
CREATE TABLE tipos_movimiento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    afecta_stock ENUM('ENTRADA', 'SALIDA', 'TRANSFERENCIA') NOT NULL,
    descripcion TEXT
);
```

#### 11. `movimientos_inventario`
Registro de todos los movimientos de inventario

```sql
CREATE TABLE movimientos_inventario (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    tipo_movimiento_id INT NOT NULL,
    sucursal_origen_id INT NULL,
    sucursal_destino_id INT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL,
    stock_anterior DECIMAL(10,2) NOT NULL,
    stock_nuevo DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(100), -- # factura, # venta, etc.
    motivo TEXT,
    usuario_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (tipo_movimiento_id) REFERENCES tipos_movimiento(id),
    FOREIGN KEY (sucursal_origen_id) REFERENCES sucursales(id),
    FOREIGN KEY (sucursal_destino_id) REFERENCES sucursales(id),
    INDEX idx_producto (producto_id),
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo_movimiento_id)
);
```

#### 12. `lotes_fifo`
Control de lotes para costeo FIFO

```sql
CREATE TABLE lotes_fifo (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    numero_lote VARCHAR(50) NOT NULL,
    fecha_compra DATE NOT NULL,
    cantidad_inicial DECIMAL(10,2) NOT NULL,
    cantidad_restante DECIMAL(10,2) NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    proveedor_id INT,
    sucursal_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    INDEX idx_producto_sucursal (producto_id, sucursal_id),
    INDEX idx_fecha (fecha_compra)
);
```

#### 13. `usuarios`
Usuarios del sistema

```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    rol ENUM('ADMIN', 'GERENTE', 'CAJERO', 'ALMACEN') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    sucursal_id INT,
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
);
```

#### 14. `alertas_stock`
Alertas generadas por stock bajo

```sql
CREATE TABLE alertas_stock (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    sucursal_id INT NOT NULL,
    tipo_alerta ENUM('STOCK_MINIMO', 'SIN_STOCK', 'SOBRE_STOCK') NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_generada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    INDEX idx_leida (leida),
    INDEX idx_fecha (fecha_generada)
);
```

#### 15. `compras`
Encabezado de compras a proveedores

```sql
CREATE TABLE compras (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    numero_factura VARCHAR(50) NOT NULL UNIQUE,
    proveedor_id INT NOT NULL,
    sucursal_id INT NOT NULL,
    fecha_compra DATE NOT NULL,
    fecha_recepcion DATE,
    subtotal DECIMAL(12,2) NOT NULL,
    impuesto DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    estado ENUM('PENDIENTE', 'RECIBIDA', 'PARCIAL', 'CANCELADA') DEFAULT 'PENDIENTE',
    observaciones TEXT,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_fecha (fecha_compra),
    INDEX idx_proveedor (proveedor_id)
);
```

#### 16. `compras_detalle`
Detalle de compras

```sql
CREATE TABLE compras_detalle (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    compra_id BIGINT NOT NULL,
    producto_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    costo_total DECIMAL(12,2) NOT NULL,
    lote VARCHAR(50),
    fecha_vencimiento DATE NULL,
    FOREIGN KEY (compra_id) REFERENCES compras(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

#### 17. `ventas`
Encabezado de ventas

```sql
CREATE TABLE ventas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    numero_venta VARCHAR(50) NOT NULL UNIQUE,
    sucursal_id INT NOT NULL,
    cliente_nombre VARCHAR(200),
    cliente_identificacion VARCHAR(50),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL,
    impuesto DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    metodo_pago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CREDITO') NOT NULL,
    estado ENUM('COMPLETADA', 'ANULADA', 'PENDIENTE') DEFAULT 'COMPLETADA',
    usuario_id INT NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_fecha (fecha_venta),
    INDEX idx_usuario (usuario_id)
);
```

#### 18. `ventas_detalle`
Detalle de ventas

```sql
CREATE TABLE ventas_detalle (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    venta_id BIGINT NOT NULL,
    producto_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

## Relaciones Clave

- **categorias** (1) → (N) **productos**
- **marcas** (1) → (N) **productos**
- **proveedores** (1) → (N) **productos**
- **unidades_medida** (1) → (N) **productos**
- **productos** (1) → (N) **producto_ubicaciones**
- **ubicaciones** (1) → (N) **producto_ubicaciones**
- **productos** (1) → (N) **stock_sucursal**
- **sucursales** (1) → (N) **stock_sucursal**
- **productos** (1) → (N) **movimientos_inventario**
- **tipos_movimiento** (1) → (N) **movimientos_inventario**
- **productos** (1) → (N) **lotes_fifo**
- **compras** (1) → (N) **compras_detalle**
- **ventas** (1) → (N) **ventas_detalle**

## Índices Recomendados para Performance

```sql
-- Búsqueda rápida de productos
CREATE INDEX idx_productos_busqueda ON productos(nombre, codigo_interno, codigo_barra);

-- Reportes de rotación
CREATE INDEX idx_ventas_producto_fecha ON ventas_detalle(producto_id);
CREATE INDEX idx_movimientos_producto_fecha ON movimientos_inventario(producto_id, fecha);

-- Alertas de stock
CREATE INDEX idx_stock_alerta ON stock_sucursal(cantidad, stock_minimo);
```

## Datos Iniciales - Tipos de Movimiento

```sql
INSERT INTO tipos_movimiento (codigo, nombre, afecta_stock, descripcion) VALUES
('COMPRA', 'Compra a Proveedor', 'ENTRADA', 'Ingreso de mercancía por compra'),
('DEV_CLI', 'Devolución Cliente', 'ENTRADA', 'Devolución de producto por cliente'),
('TRAS_IN', 'Transferencia Entrada', 'ENTRADA', 'Recepción de transferencia de otra sucursal'),
('AJUSTE+', 'Ajuste Positivo', 'ENTRADA', 'Ajuste de inventario por incremento'),
('VENTA', 'Venta', 'SALIDA', 'Salida por venta a cliente'),
('MERMA', 'Merma/Pérdida', 'SALIDA', 'Pérdida por daño, robo o caducidad'),
('USO_INT', 'Uso Interno', 'SALIDA', 'Uso del producto en operaciones internas'),
('TRAS_OUT', 'Transferencia Salida', 'TRANSFERENCIA', 'Envío a otra sucursal'),
('AJUSTE-', 'Ajuste Negativo', 'SALIDA', 'Ajuste de inventario por decremento'),
('DEV_PROV', 'Devolución Proveedor', 'SALIDA', 'Devolución de mercancía al proveedor');
```

## Datos Iniciales - Unidades de Medida

```sql
INSERT INTO unidades_medida (codigo, nombre, abreviatura, tipo, factor_conversion) VALUES
('PZA', 'Pieza', 'pza', 'pieza', 1.0),
('CJA', 'Caja', 'cja', 'pieza', 1.0),
('BLI', 'Blíster', 'bli', 'pieza', 1.0),
('M', 'Metro', 'm', 'longitud', 1.0),
('CM', 'Centímetro', 'cm', 'longitud', 0.01),
('KG', 'Kilogramo', 'kg', 'peso', 1.0),
('G', 'Gramo', 'g', 'peso', 0.001),
('L', 'Litro', 'L', 'volumen', 1.0),
('ML', 'Mililitro', 'ml', 'volumen', 0.001);
```
