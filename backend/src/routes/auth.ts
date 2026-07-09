import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export function registerAuthRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Login
  fastify.post('/api/auth/login', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };
    
    const usuario = await prisma.usuario.findUnique({
      where: { username },
      include: { sucursal: true },
    });
    
    if (!usuario) {
      reply.code(401).send({ error: 'Credenciales inválidas' });
      return;
    }
    
    const validPassword = await bcrypt.compare(password, usuario.passwordHash);
    
    if (!validPassword) {
      reply.code(401).send({ error: 'Credenciales inválidas' });
      return;
    }
    
    if (!usuario.activo) {
      reply.code(401).send({ error: 'Usuario inactivo' });
      return;
    }
    
    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });
    
    // Generar token
    const token = fastify.jwt.sign({
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
    });
    
    return {
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nombreCompleto: usuario.nombreCompleto,
        rol: usuario.rol,
        sucursal: usuario.sucursal,
      },
    };
  });

  // Verificar token
  fastify.get('/api/auth/me', async (request, reply) => {
    try {
      await request.jwtVerify();
      return request.user;
    } catch (error) {
      reply.code(401).send({ error: 'Token inválido' });
    }
  });
}
