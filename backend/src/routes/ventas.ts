import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export function registerVentasRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Obtener todas las ventas
  fastify.get('/api/ventas', async (request, reply) => {
  const ventas = await prisma.venta.findMany({
    include: {
      sucursal: true,
      usuario: true,
      detalles: {
        include: { producto: true },
      },
    },
    orderBy: { fechaVenta: 'desc' },
    take: 50,
  });
  return ventas;
});

// Obtener una venta por ID
fastify.get('/api/ventas/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const venta = await prisma.venta.findUnique({
    where: { id: parseInt(id) },
    include: {
      sucursal: true,
      usuario: true,
      detalles: {
        include: { producto: true },
      },
    },
  });
  
  if (!venta) {
    reply.code(404).send({ error: 'Venta no encontrada' });
    return;
  }
  
  return venta;
});

// Crear venta con control de concurrencia
fastify.post('/api/ventas', async (request, reply) => {
  const ventaData = request.body as any;
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Paso 1: Verificar stock para cada item
      for (const item of ventaData.items) {
        const stockSucursal = await tx.stockSucursal.findUnique({
          where: {
            productoId_sucursalId: {
              productoId: item.productoId,
              sucursalId: ventaData.sucursalId,
            },
          },
        });
        
        if (!stockSucursal || stockSucursal.cantidad < item.cantidad) {
          throw new Error(
            `Stock insuficiente para producto ID ${item.productoId}. ` +
            `Disponible: ${stockSucursal?.cantidad || 0}, Solicitado: ${item.cantidad}`
          );
        }
      }
      
      // Paso 2: Generar número de venta
      const fecha = new Date();
      const prefijo = `V${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const count = await tx.venta.count({
        where: { numeroVenta: { startsWith: prefijo } },
      });
      const numeroVenta = `${prefijo}${String(count + 1).padStart(6, '0')}`;
      
      // Paso 3: Calcular totales
      let subtotal = 0;
      for (const item of ventaData.items) {
        subtotal += item.cantidad * item.precioUnitario;
      }
      const impuesto = ventaData.impuesto || 0;
      const descuento = ventaData.descuento || 0;
      const total = subtotal + impuesto - descuento;
      
      // Paso 4: Crear venta
      const venta = await tx.venta.create({
        data: {
          numeroVenta,
          sucursalId: ventaData.sucursalId,
          clienteNombre: ventaData.clienteNombre,
          clienteIdentificacion: ventaData.clienteIdentificacion,
          subtotal,
          impuesto,
          descuento,
          total,
          metodoPago: ventaData.metodoPago,
          estado: 'COMPLETADA',
          usuarioId: ventaData.usuarioId,
          observaciones: ventaData.observaciones,
        },
      });
      
      // Paso 5: Procesar items
      for (const item of ventaData.items) {
        // Obtener producto para costo
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          select: { costoPromedio: true, stockMinimo: true, nombre: true },
        });
        
        // Insertar detalle
        await tx.ventaDetalle.create({
          data: {
            ventaId: venta.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            descuentoUnitario: item.descuentoUnitario || 0,
            subtotal: item.cantidad * item.precioUnitario,
            costoUnitario: producto?.costoPromedio || 0,
          },
        });
        
        // Actualizar stock productos
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stockActual: { decrement: item.cantidad } },
        });
        
        // Actualizar stock sucursal
        const stockSucursal = await tx.stockSucursal.update({
          where: {
            productoId_sucursalId: {
              productoId: item.productoId,
              sucursalId: ventaData.sucursalId,
            },
          },
          data: { cantidad: { decrement: item.cantidad } },
        });
        
        const stockAnterior = stockSucursal.cantidad + item.cantidad;
        const stockNuevo = stockSucursal.cantidad;
        
        // Registrar movimiento
        const tipoMovimiento = await tx.tipoMovimiento.findUnique({
          where: { codigo: 'VENTA' },
        });
        
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipoMovimientoId: tipoMovimiento!.id,
            sucursalOrigenId: ventaData.sucursalId,
            cantidad: item.cantidad,
            costoUnitario: producto?.costoPromedio || 0,
            costoTotal: item.cantidad * (producto?.costoPromedio || 0),
            stockAnterior,
            stockNuevo,
            referencia: venta.numeroVenta,
            motivo: `Venta #${venta.numeroVenta}`,
            usuarioId: ventaData.usuarioId,
          },
        });
        
        // Generar alerta si es necesario
        if (stockNuevo <= (producto?.stockMinimo || 0)) {
          await tx.alertaStock.create({
            data: {
              productoId: item.productoId,
              sucursalId: ventaData.sucursalId,
              tipoAlerta: stockNuevo === 0 ? 'SIN_STOCK' : 'STOCK_MINIMO',
              mensaje: `Producto ${producto?.nombre} con stock crítico: ${stockNuevo}`,
            },
          });
        }
      }
      
      return venta;
    });
    
    return { exito: true, ventaId: result.id, numeroVenta: result.numeroVenta };
  } catch (error: any) {
    reply.code(400).send({ error: error.message });
  }
});

  // Anular venta
  fastify.post('/api/ventas/:id/anular', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      await prisma.venta.update({
        where: { id: parseInt(id) },
        data: { estado: 'ANULADA' },
      });
      return { message: 'Venta anulada' };
    } catch (error) {
      reply.code(404).send({ error: 'Venta no encontrada' });
    }
  });
}
