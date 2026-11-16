// Crea la base de datos (migraciones) y carga los datos iniciales.
// Se ejecuta en postinstall para que el despliegue funcione sin pasos manuales.
const { execSync } = require('child_process');
const path = require('path');

process.env.DATABASE_URL ||= 'file:./dev.db';

const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });

try {
  run('npx prisma migrate deploy');
  run('node prisma/seed.js');
  console.log('✅ Base de datos lista');
} catch (err) {
  console.error('⚠️  No se pudo preparar la base de datos:', err.message);
}
