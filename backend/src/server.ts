import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

// Configuración
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Registrar plugins
fastify.register(cors, {
  origin: true,
});

fastify.register(jwt, {
  secret: JWT_SECRET,
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Ruta raíz
fastify.get('/', async () => {
  return {
    message: 'Sistema de Gestión de Inventario - Ferretería',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth/login',
      productos: '/api/productos',
      ventas: '/api/ventas',
      inventario: '/api/inventario/stock',
    },
  };
});

// Registrar rutas
import { registerProductosRoutes } from './routes/productos';
import { registerVentasRoutes } from './routes/ventas';
import { registerAuthRoutes } from './routes/auth';
import { registerInventarioRoutes } from './routes/inventario';

registerProductosRoutes(fastify, prisma);
registerVentasRoutes(fastify, prisma);
registerAuthRoutes(fastify, prisma);
registerInventarioRoutes(fastify, prisma);

// Iniciar servidor
const start = async () => {
  try {
    await fastify.listen({ port: PORT as number, host: '0.0.0.0' });
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
