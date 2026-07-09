import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export function registerProductosRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Obtener todos los productos
  fastify.get('/api/productos', async (request, reply) => {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
        marca: true,
        unidadMedida: true,
        proveedorPrincipal: true,
      },
      orderBy: { nombre: 'asc' },
    });
    return productos;
  });

  // Obtener un producto por ID
  fastify.get('/api/productos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
        marca: true,
        unidadMedida: true,
        proveedorPrincipal: true,
        productoUbicaciones: {
          include: { ubicacion: true },
        },
        stockSucursales: {
          include: { sucursal: true },
        },
      },
    });
    
    if (!producto) {
      reply.code(404).send({ error: 'Producto no encontrado' });
      return;
    }
    
    return producto;
  });

  // Buscar productos
  fastify.get('/api/productos/search', async (request, reply) => {
    const { q } = request.query as { q?: string };
    
    if (!q) {
      return [];
    }
    
    const productos = await prisma.producto.findMany({
      where: {
        OR: [
          { codigoInterno: { contains: q } },
          { codigoBarra: { contains: q } },
          { nombre: { contains: q } },
        ],
        activo: true,
      },
      include: {
        categoria: true,
        marca: true,
        unidadMedida: true,
      },
      take: 20,
    });
    
    return productos;
  });

  // Crear producto
  fastify.post('/api/productos', async (request, reply) => {
    const data = request.body as any;
    
    try {
      const producto = await prisma.producto.create({
        data,
        include: {
          categoria: true,
          marca: true,
          unidadMedida: true,
        },
      });
      
      // Crear stock en sucursal principal
      await prisma.stockSucursal.create({
        data: {
          productoId: producto.id,
          sucursalId: 1,
          cantidad: producto.stockActual,
          stockMinimo: producto.stockMinimo,
        },
      });
      
      return producto;
    } catch (error) {
      reply.code(400).send({ error: 'Error al crear producto' });
    }
  });

  // Actualizar producto
  fastify.put('/api/productos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    
    try {
      const producto = await prisma.producto.update({
        where: { id: parseInt(id) },
        data,
        include: {
          categoria: true,
          marca: true,
          unidadMedida: true,
        },
      });
      return producto;
    } catch (error) {
      reply.code(404).send({ error: 'Producto no encontrado' });
    }
  });

  // Eliminar producto (soft delete)
  fastify.delete('/api/productos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      await prisma.producto.update({
        where: { id: parseInt(id) },
        data: { activo: false },
      });
      return { message: 'Producto eliminado' };
    } catch (error) {
      reply.code(404).send({ error: 'Producto no encontrado' });
    }
  });
}
