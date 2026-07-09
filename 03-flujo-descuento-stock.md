# Flujo Lógico de Descuento de Stock con Control de Concurrencia

## Escenario: Proceso de Venta

El sistema debe garantizar que no se vendan productos sin stock suficiente, incluso cuando múltiples cajeros procesan ventas simultáneas del mismo producto.

## Estrategia de Control de Concurrencia

### Opción 1: Optimistic Locking (Recomendado para alta concurrencia)
Usa versiones o timestamps para detectar conflictos.

### Opción 2: Pessimistic Locking (Recomendado para ferretería)
Bloquea explícitamente el registro durante la transacción. Más simple y garantiza consistencia.

### Opción 3: Redis Distributed Lock
Para sistemas distribuidos con múltiples servidores.

---

## Flujo Completo con Pessimistic Locking (Base de Datos)

### Pseudocódigo - Proceso de Venta

```
FUNCIÓN procesar_venta(venta_request):
    INICIAR TRANSACCIÓN DE BASE DE DATOS
    
    // Paso 1: Validar datos de entrada
    SI venta_request.items está vacío:
        RETORNAR error "La venta no tiene items"
    
    // Paso 2: Verificar stock disponible para cada item
    PARA CADA item EN venta_request.items:
        // BLOQUEAR FILA DEL PRODUCTO PARA EVITAR RACE CONDITIONS
        SELECT * FROM productos 
        WHERE id = item.producto_id 
        FOR UPDATE
        
        // También bloquear stock por sucursal
        SELECT * FROM stock_sucursal 
        WHERE producto_id = item.producto_id 
          AND sucursal_id = venta_request.sucursal_id
        FOR UPDATE
        
        SI stock_sucursal.cantidad < item.cantidad:
            ROLLBACK TRANSACCIÓN
            RETORNAR error "Stock insuficiente para producto {producto.nombre}"
    
    // Paso 3: Calcular totales
    subtotal = SUMAR(item.cantidad * item.precio_unitario PARA CADA item)
    impuesto = subtotal * tasa_impuesto
    total = subtotal + impuesto - venta_request.descuento
    
    // Paso 4: Crear registro de venta (encabezado)
    venta_id = INSERT INTO ventas (
        numero_venta,
        sucursal_id,
        cliente_nombre,
        cliente_identificacion,
        subtotal,
        impuesto,
        descuento,
        total,
        metodo_pago,
        estado,
        usuario_id
    ) VALUES (
        GENERAR_NUMERO_VENTA(),
        venta_request.sucursal_id,
        venta_request.cliente_nombre,
        venta_request.cliente_identificacion,
        subtotal,
        impuesto,
        venta_request.descuento,
        total,
        venta_request.metodo_pago,
        'COMPLETADA',
        venta_request.usuario_id
    )
    
    // Paso 5: Procesar cada item de la venta
    PARA CADA item EN venta_request.items:
        
        // 5.1: Insertar detalle de venta
        INSERT INTO ventas_detalle (
            venta_id,
            producto_id,
            cantidad,
            precio_unitario,
            descuento_unitario,
            subtotal,
            costo_unitario
        ) VALUES (
            venta_id,
            item.producto_id,
            item.cantidad,
            item.precio_unitario,
            item.descuento_unitario,
            item.cantidad * item.precio_unitario,
            OBTENER_COSTO_ACTUAL(item.producto_id)
        )
        
        // 5.2: Actualizar stock del producto (tabla principal)
        UPDATE productos 
        SET stock_actual = stock_actual - item.cantidad,
            updated_at = NOW()
        WHERE id = item.producto_id
        
        // 5.3: Actualizar stock por sucursal
        UPDATE stock_sucursal 
        SET cantidad = cantidad - item.cantidad,
            updated_at = NOW()
        WHERE producto_id = item.producto_id 
          AND sucursal_id = venta_request.sucursal_id
        
        // 5.4: Registrar movimiento de inventario
        stock_anterior = OBTENER_STOCK_ANTERIOR(item.producto_id, venta_request.sucursal_id)
        stock_nuevo = stock_anterior - item.cantidad
        
        INSERT INTO movimientos_inventario (
            producto_id,
            tipo_movimiento_id,
            sucursal_origen_id,
            cantidad,
            costo_unitario,
            costo_total,
            stock_anterior,
            stock_nuevo,
            referencia,
            motivo,
            usuario_id,
            fecha
        ) VALUES (
            item.producto_id,
            (SELECT id FROM tipos_movimiento WHERE codigo = 'VENTA'),
            venta_request.sucursal_id,
            item.cantidad,
            OBTENER_COSTO_ACTUAL(item.producto_id),
            item.cantidad * OBTENER_COSTO_ACTUAL(item.producto_id),
            stock_anterior,
            stock_nuevo,
            venta_id,
            'Venta #' || venta_id,
            venta_request.usuario_id,
            NOW()
        )
        
        // 5.5: Actualizar lotes FIFO si el producto usa FIFO
        SI producto.metodo_costeo = 'FIFO':
            ACTUALIZAR_LOTES_FIFO(item.producto_id, item.cantidad, venta_request.sucursal_id)
        
        // 5.6: Verificar si se debe generar alerta de stock bajo
        SI stock_nuevo <= producto.stock_minimo:
            INSERT INTO alertas_stock (
                producto_id,
                sucursal_id,
                tipo_alerta,
                mensaje,
                fecha_generada
            ) VALUES (
                item.producto_id,
                venta_request.sucursal_id,
                'STOCK_MINIMO',
                CONCAT('Producto ', producto.nombre, ' está por debajo del stock mínimo'),
                NOW()
            )
        
        SI stock_nuevo = 0:
            INSERT INTO alertas_stock (
                producto_id,
                sucursal_id,
                tipo_alerta,
                mensaje,
                fecha_generada
            ) VALUES (
                item.producto_id,
                venta_request.sucursal_id,
                'SIN_STOCK',
                CONCAT('Producto ', producto.nombre, ' está sin stock'),
                NOW()
            )
    
    // Paso 6: Commit de la transacción
    COMMIT TRANSACCIÓN
    
    // Paso 7: Invalidar cache de Redis
    INVALIDAR_CACHE(productos_afectados)
    
    RETORNAR { éxito: true, venta_id: venta_id, total: total }

CATCH error:
    ROLLBACK TRANSACCIÓN
    RETORNAR { éxito: false, error: error.mensaje }
```

---

## Implementación con Redis Distributed Lock (Sistemas Distribuidos)

### Pseudocódigo - Lock Distribuido

```
FUNCIÓN procesar_venta_con_lock(venta_request):
    lock_key = "lock:venta:" + venta_request.sucursal_id
    lock_token = GENERAR_TOKEN_UNICO()
    lock_adquirido = FALSE
    
    TRY:
        // Intentar adquirir lock con timeout de 30 segundos
        lock_adquirido = Redis.SET(
            key: lock_key,
            value: lock_token,
            options: { NX: true, EX: 30 }  // NX: solo si no existe, EX: expiración 30s
        )
        
        SI NO lock_adquirido:
            RETORNAR error "Sistema ocupado, intente nuevamente"
        
        // Ejecutar lógica de venta dentro del lock
        resultado = EJECUTAR_LOGICA_VENTA(venta_request)
        
        RETORNAR resultado
        
    FINALLY:
        // Liberar lock solo si lo adquirimos
        SI lock_adquirido:
            // Verificar que el lock todavía nos pertenece (Lua script atómico)
            script = """
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
            """
            Redis.EVAL(script, [lock_key], [lock_token])
```

---

## Implementación SQL Específica por Motor

### PostgreSQL (con FOR UPDATE)

```sql
BEGIN;

-- Bloquear productos y stock
SELECT p.id, p.nombre, p.stock_actual, p.stock_minimo, p.metodo_costeo,
       ss.cantidad as stock_sucursal
FROM productos p
JOIN stock_sucursal ss ON p.id = ss.producto_id
WHERE p.id = $1 AND ss.sucursal_id = $2
FOR UPDATE;

-- Verificar stock
-- (validación en aplicación)

-- Actualizar stock
UPDATE productos 
SET stock_actual = stock_actual - $3
WHERE id = $1;

UPDATE stock_sucursal 
SET cantidad = cantidad - $3
WHERE producto_id = $1 AND sucursal_id = $2;

-- Registrar movimiento
INSERT INTO movimientos_inventario (...)
VALUES (...);

-- Crear venta
INSERT INTO ventas (...) VALUES (...);

COMMIT;
```

### MySQL (con FOR UPDATE)

```sql
START TRANSACTION;

-- Bloquear productos
SELECT * FROM productos WHERE id = ? FOR UPDATE;
SELECT * FROM stock_sucursal WHERE producto_id = ? AND sucursal_id = ? FOR UPDATE;

-- Resto igual que PostgreSQL

COMMIT;
```

### SQL Server (con UPDLOCK / HOLDLOCK)

```sql
BEGIN TRANSACTION;

-- Bloquear productos
SELECT * FROM productos WITH (UPDLOCK, HOLDLOCK) WHERE id = @producto_id;
SELECT * FROM stock_sucursal WITH (UPDLOCK, HOLDLOCK) 
WHERE producto_id = @producto_id AND sucursal_id = @sucursal_id;

-- Resto igual que PostgreSQL

COMMIT TRANSACTION;
```

---

## Implementación en Código (Node.js + Prisma)

```typescript
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function procesarVenta(ventaRequest: VentaRequest) {
  return await prisma.$transaction(async (tx) => {
    // Paso 1: Validar y bloquear stock de cada producto
    for (const item of ventaRequest.items) {
      // Bloquear producto y stock con FOR UPDATE
      const producto = await tx.productos.findUnique({
        where: { id: item.productoId },
        select: {
          id: true,
          nombre: true,
          stockActual: true,
          stockMinimo: true,
          metodoCosteo: true,
        },
      });

      const stockSucursal = await tx.stockSucursal.findUnique({
        where: {
          productoId_sucursalId: {
            productoId: item.productoId,
            sucursalId: ventaRequest.sucursalId,
          },
        },
      });

      // Verificar stock disponible
      if (!stockSucursal || stockSucursal.cantidad < item.cantidad) {
        throw new Error(
          `Stock insuficiente para producto ${producto?.nombre}. ` +
          `Disponible: ${stockSucursal?.cantidad || 0}, Solicitado: ${item.cantidad}`
        );
      }
    }

    // Paso 2: Crear venta
    const venta = await tx.ventas.create({
      data: {
        numeroVenta: await generarNumeroVenta(tx),
        sucursalId: ventaRequest.sucursalId,
        clienteNombre: ventaRequest.clienteNombre,
        clienteIdentificacion: ventaRequest.clienteIdentificacion,
        subtotal: ventaRequest.subtotal,
        impuesto: ventaRequest.impuesto,
        descuento: ventaRequest.descuento,
        total: ventaRequest.total,
        metodoPago: ventaRequest.metodoPago,
        estado: 'COMPLETADA',
        usuarioId: ventaRequest.usuarioId,
      },
    });

    // Paso 3: Procesar items
    for (const item of ventaRequest.items) {
      // Insertar detalle
      await tx.ventasDetalle.create({
        data: {
          ventaId: venta.id,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          descuentoUnitario: item.descuentoUnitario || 0,
          subtotal: item.cantidad * item.precioUnitario,
          costoUnitario: await obtenerCostoActual(tx, item.productoId),
        },
      });

      // Actualizar stock productos
      await tx.productos.update({
        where: { id: item.productoId },
        data: {
          stockActual: { decrement: item.cantidad },
        },
      });

      // Actualizar stock sucursal
      const stockSucursal = await tx.stockSucursal.update({
        where: {
          productoId_sucursalId: {
            productoId: item.productoId,
            sucursalId: ventaRequest.sucursalId,
          },
        },
        data: {
          cantidad: { decrement: item.cantidad },
        },
      });

      const stockAnterior = stockSucursal.cantidad + item.cantidad;
      const stockNuevo = stockSucursal.cantidad;
      const costoUnitario = await obtenerCostoActual(tx, item.productoId);

      // Registrar movimiento
      await tx.movimientosInventario.create({
        data: {
          productoId: item.productoId,
          tipoMovimientoId: await obtenerTipoMovimiento(tx, 'VENTA'),
          sucursalOrigenId: ventaRequest.sucursalId,
          cantidad: item.cantidad,
          costoUnitario,
          costoTotal: item.cantidad * costoUnitario,
          stockAnterior,
          stockNuevo,
          referencia: venta.numeroVenta,
          motivo: `Venta #${venta.numeroVenta}`,
          usuarioId: ventaRequest.usuarioId,
          fecha: new Date(),
        },
      });

      // Actualizar lotes FIFO si aplica
      const producto = await tx.productos.findUnique({
        where: { id: item.productoId },
        select: { metodoCosteo: true },
      });

      if (producto?.metodoCosteo === 'FIFO') {
        await actualizarLotesFIFO(tx, item.productoId, item.cantidad, ventaRequest.sucursalId);
      }

      // Generar alertas si es necesario
      if (stockNuevo <= (await obtenerStockMinimo(tx, item.productoId))) {
        await tx.alertasStock.create({
          data: {
            productoId: item.productoId,
            sucursalId: ventaRequest.sucursalId,
            tipoAlerta: stockNuevo === 0 ? 'SIN_STOCK' : 'STOCK_MINIMO',
            mensaje: `Producto ${item.productoId} con stock crítico: ${stockNuevo}`,
            fechaGenerada: new Date(),
          },
        });
      }
    }

    return { exito: true, ventaId: venta.id, total: venta.total };
  });
}

// Helper para obtener tipo de movimiento
async function obtenerTipoMovimiento(tx: any, codigo: string) {
  const tipo = await tx.tiposMovimiento.findUnique({
    where: { codigo },
    select: { id: true },
  });
  return tipo?.id;
}

// Helper para obtener costo actual
async function obtenerCostoActual(tx: any, productoId: number) {
  const producto = await tx.productos.findUnique({
    where: { id: productoId },
    select: { costoPromedio: true },
  });
  return producto?.costoPromedio || 0;
}

// Helper para generar número de venta único
async function generarNumeroVenta(tx: any) {
  const fecha = new Date();
  const prefijo = `V${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  
  // Contar ventas del mes
  const count = await tx.ventas.count({
    where: {
      numeroVenta: { startsWith: prefijo },
    },
  });
  
  return `${prefijo}${String(count + 1).padStart(6, '0')}`;
}

// Helper para actualizar lotes FIFO
async function actualizarLotesFIFO(tx: any, productoId: number, cantidad: number, sucursalId: number) {
  let cantidadRestante = cantidad;
  
  // Obtener lotes ordenados por fecha (más antiguos primero)
  const lotes = await tx.lotesFifo.findMany({
    where: {
      productoId,
      sucursalId,
      cantidadRestante: { gt: 0 },
      activo: true,
    },
    orderBy: { fechaCompra: 'asc' },
  });
  
  for (const lote of lotes) {
    if (cantidadRestante <= 0) break;
    
    const cantidadADescontar = Math.min(cantidadRestante, lote.cantidadRestante);
    
    await tx.lotesFifo.update({
      where: { id: lote.id },
      data: {
        cantidadRestante: { decrement: cantidadADescontar },
        activo: lote.cantidadRestante - cantidadADescontar > 0,
      },
    });
    
    cantidadRestante -= cantidadADescontar;
  }
}
```

---

## Manejo de Errores y Reintentos

### Estrategia de Reintentos

```typescript
async function procesarVentaConReintentos(ventaRequest: VentaRequest, maxReintentos = 3) {
  for (let intento = 1; intento <= maxReintentos; intento++) {
    try {
      return await procesarVenta(ventaRequest);
    } catch (error) {
      if (error.code === 'P2034') { // Error de concurrencia en Prisma
        if (intento === maxReintentos) {
          throw new Error('El sistema está ocupado. Por favor intente nuevamente.');
        }
        // Esperar antes de reintentar (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 100 * intento));
      } else {
        throw error; // Otros errores no se reintentan
      }
    }
  }
}
```

---

## Diagrama de Secuencia

```
Usuario          Frontend           Backend              DB                  Redis
  │                │                  │                   │                   │
  │--- Venta ─────>│                  │                   │                   │
  │                │--- POST /api/sales ────────────────>│                   │
  │                │                  │                   │                   │
  │                │                  │--- BEGIN TRANSACTION ──────────────>│
  │                │                  │                   │                   │
  │                │                  │--- SELECT ... FOR UPDATE ──────────>│
  │                │                  │                   │<── Row Locked ────│
  │                │                  │                   │                   │
  │                │                  │--- Verificar stock ───────────────>│
  │                │                  │                   │                   │
  │                │                  │--- UPDATE stock ──────────────────>│
  │                │                  │                   │                   │
  │                │                  │--- INSERT movimiento ─────────────>│
  │                │                  │                   │                   │
  │                │                  │--- INSERT venta ──────────────────>│
  │                │                  │                   │                   │
  │                │                  │--- COMMIT ───────────────────────>│
  │                │                  │                   │                   │
  │                │                  │--- DEL cache ─────────────────────────────────>│
  │                │                  │                   │                   │
  │                │<── 200 OK ──────│                   │                   │
  │<── Venta exitosa│                  │                   │                   │
```

---

## Consideraciones Adicionales

### 1. Tiempo de Lock
- Mantener las transacciones cortas (< 5 segundos idealmente)
- Evitar llamadas a servicios externos dentro de la transacción

### 2. Deadlocks
- Siempre acceder a las tablas en el mismo orden
- Usar timeouts en las transacciones

### 3. Stock Negativo
- Nunca permitir stock negativo en base de datos
- Validar en aplicación antes de actualizar

### 4. Auditoría
- Todo movimiento debe quedar registrado en `movimientos_inventario`
- Incluir usuario, fecha, y motivo

### 5. Rollbacks
- Si cualquier paso falla, hacer rollback completo
- Nunca dejar stock parcialmente actualizado

### 6. Performance
- Usar índices en las columnas de búsqueda
- Considerar particionamiento por sucursal si el volumen es muy alto
- Cache de productos frecuentes (invalidar al actualizar stock)
