import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export function registerDashboardRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Estadísticas resumidas para el panel principal
  fastify.get('/api/dashboard/stats', async () => {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const inicioManana = new Date(inicioHoy);
    inicioManana.setDate(inicioManana.getDate() + 1);

    const [totalProductos, productos, ventasHoy] = await Promise.all([
      prisma.producto.count({ where: { activo: true } }),
      prisma.producto.findMany({
        where: { activo: true },
        select: { stockActual: true, stockMinimo: true, costoPromedio: true },
      }),
      prisma.venta.aggregate({
        where: {
          estado: 'COMPLETADA',
          fechaVenta: { gte: inicioHoy, lt: inicioManana },
        },
        _count: { id: true },
        _sum: { total: true },
      }),
    ]);

    const stockBajo = productos.filter((p) => p.stockActual <= p.stockMinimo).length;
    const valorInventario = productos.reduce((acc, p) => acc + p.stockActual * p.costoPromedio, 0);

    return {
      totalProductos,
      stockBajo,
      ventasHoy: ventasHoy._count.id,
      montoVentasHoy: ventasHoy._sum.total ?? 0,
      valorInventario,
    };
  });
}
