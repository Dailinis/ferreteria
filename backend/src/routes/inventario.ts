import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export function registerInventarioRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Obtener stock actual
  fastify.get('/api/inventario/stock', async (request, reply) => {
    const stock = await prisma.stockSucursal.findMany({
      include: {
        producto: {
          include: {
            categoria: true,
            marca: true,
            unidadMedida: true,
          },
        },
        sucursal: true,
      },
    });
    return stock;
  });

  // Obtener alertas de stock
  fastify.get('/api/inventario/alertas', async (request, reply) => {
    const alertas = await prisma.alertaStock.findMany({
      where: { leida: false },
      orderBy: { fechaGenerada: 'desc' },
      take: 50,
    });
    return alertas;
  });

  // Marcar alerta como leída
  fastify.put('/api/inventario/alertas/:id/leer', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    await prisma.alertaStock.update({
      where: { id: parseInt(id) },
      data: { leida: true },
    });
    
    return { message: 'Alerta marcada como leída' };
  });

  // Obtener movimientos de inventario
  fastify.get('/api/inventario/movimientos', async (request, reply) => {
    const { productoId, limit = '50' } = request.query as { productoId?: string; limit?: string };
    
    const where = productoId ? { productoId: parseInt(productoId) } : {};
    
    const movimientos = await prisma.movimientoInventario.findMany({
      where,
      include: {
        producto: true,
        tipoMovimiento: true,
        sucursalOrigen: true,
        sucursalDestino: true,
        usuario: true,
      },
      orderBy: { fecha: 'desc' },
      take: parseInt(limit),
    });
    
    return movimientos;
  });

  // Crear movimiento manual (ajuste)
  fastify.post('/api/inventario/movimientos', async (request, reply) => {
    const movimientoData = request.body as any;
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        const producto = await tx.producto.findUnique({
          where: { id: movimientoData.productoId },
        });
        
        if (!producto) {
          throw new Error('Producto no encontrado');
        }
        
        const tipoMovimiento = await tx.tipoMovimiento.findUnique({
          where: { codigo: movimientoData.tipoCodigo },
        });
        
        if (!tipoMovimiento) {
          throw new Error('Tipo de movimiento no encontrado');
        }
        
        // Calcular stock nuevo
        const stockSucursal = await tx.stockSucursal.findUnique({
          where: {
            productoId_sucursalId: {
              productoId: movimientoData.productoId,
              sucursalId: movimientoData.sucursalId,
            },
          },
        });
        
        if (!stockSucursal) {
          throw new Error('Stock no encontrado para este producto y sucursal');
        }
        
        const cantidad = movimientoData.cantidad;
        const stockAnterior = stockSucursal.cantidad;
        let stockNuevo = stockAnterior;
        
        if (tipoMovimiento.afectaStock === 'ENTRADA') {
          stockNuevo = stockAnterior + cantidad;
          await tx.producto.update({
            where: { id: movimientoData.productoId },
            data: { stockActual: { increment: cantidad } },
          });
          await tx.stockSucursal.update({
            where: { id: stockSucursal.id },
            data: { cantidad: { increment: cantidad } },
          });
        } else if (tipoMovimiento.afectaStock === 'SALIDA') {
          if (stockAnterior < cantidad) {
            throw new Error('Stock insuficiente');
          }
          stockNuevo = stockAnterior - cantidad;
          await tx.producto.update({
            where: { id: movimientoData.productoId },
            data: { stockActual: { decrement: cantidad } },
          });
          await tx.stockSucursal.update({
            where: { id: stockSucursal.id },
            data: { cantidad: { decrement: cantidad } },
          });
        }
        
        // Crear movimiento
        const movimiento = await tx.movimientoInventario.create({
          data: {
            productoId: movimientoData.productoId,
            tipoMovimientoId: tipoMovimiento.id,
            sucursalOrigenId: movimientoData.sucursalId,
            cantidad,
            costoUnitario: producto.costoPromedio,
            costoTotal: cantidad * producto.costoPromedio,
            stockAnterior,
            stockNuevo,
            referencia: movimientoData.referencia,
            motivo: movimientoData.motivo,
            usuarioId: movimientoData.usuarioId,
          },
        });
        
        return movimiento;
      });
      
      return result;
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Obtener categorías
  fastify.get('/api/categorias', async () => {
    return await prisma.categoria.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  });

  // Obtener marcas
  fastify.get('/api/marcas', async () => {
    return await prisma.marca.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  });

  // Obtener proveedores
  fastify.get('/api/proveedores', async () => {
    return await prisma.proveedor.findMany({
      where: { activo: true },
      orderBy: { razonSocial: 'asc' },
    });
  });

  // Obtener unidades de medida
  fastify.get('/api/unidades', async () => {
    return await prisma.unidadMedida.findMany({
      orderBy: { nombre: 'asc' },
    });
  });

  // Obtener sucursales
  fastify.get('/api/sucursales', async () => {
    return await prisma.sucursal.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  });
}
