"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed de base de datos...');
    // Crear usuario admin
    const passwordHash = await bcrypt_1.default.hash('admin123', 10);
    const admin = await prisma.usuario.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash,
            nombreCompleto: 'Administrador',
            email: 'admin@ferreteria.com',
            rol: 'ADMIN',
            activo: true,
        },
    });
    console.log('✅ Usuario admin creado');
    // Crear sucursal principal
    const sucursal = await prisma.sucursal.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            nombre: 'Sucursal Principal',
            direccion: 'Calle Principal #123',
            telefono: '555-1234',
            esBodega: false,
            activo: true,
        },
    });
    console.log('✅ Sucursal principal creada');
    // Crear categorías
    const categorias = await Promise.all([
        prisma.categoria.upsert({
            where: { nombre: 'Herramientas' },
            update: {},
            create: { nombre: 'Herramientas', descripcion: 'Herramientas manuales y eléctricas' },
        }),
        prisma.categoria.upsert({
            where: { nombre: 'Electricidad' },
            update: {},
            create: { nombre: 'Electricidad', descripcion: 'Cables, interruptores, iluminación' },
        }),
        prisma.categoria.upsert({
            where: { nombre: 'Plomería' },
            update: {},
            create: { nombre: 'Plomería', descripcion: 'Tuberías, grifos, accesorios' },
        }),
        prisma.categoria.upsert({
            where: { nombre: 'Construcción' },
            update: {},
            create: { nombre: 'Construcción', descripcion: 'Cemento, arena, materiales' },
        }),
        prisma.categoria.upsert({
            where: { nombre: 'Tornillería' },
            update: {},
            create: { nombre: 'Tornillería', descripcion: 'Tornillos, tuercas, clavos' },
        }),
        prisma.categoria.upsert({
            where: { nombre: 'Pinturas' },
            update: {},
            create: { nombre: 'Pinturas', descripcion: 'Pinturas, brochas, rodillos' },
        }),
    ]);
    console.log('✅ Categorías creadas');
    // Crear marcas
    const marcas = await Promise.all([
        prisma.marca.upsert({
            where: { nombre: 'Stanley' },
            update: {},
            create: { nombre: 'Stanley', paisOrigen: 'USA' },
        }),
        prisma.marca.upsert({
            where: { nombre: 'Bosch' },
            update: {},
            create: { nombre: 'Bosch', paisOrigen: 'Alemania' },
        }),
        prisma.marca.upsert({
            where: { nombre: '3M' },
            update: {},
            create: { nombre: '3M', paisOrigen: 'USA' },
        }),
    ]);
    console.log('✅ Marcas creadas');
    // Crear proveedores
    const proveedores = await Promise.all([
        prisma.proveedor.upsert({
            where: { rucNit: '1234567890' },
            update: {},
            create: {
                razonSocial: 'Distribuidora Nacional S.A.',
                rucNit: '1234567890',
                telefono: '555-1000',
                email: 'ventas@distnacional.com',
                creditoDias: 30,
            },
        }),
        prisma.proveedor.upsert({
            where: { rucNit: '0987654321' },
            update: {},
            create: {
                razonSocial: 'Importadora Global Ltda.',
                rucNit: '0987654321',
                telefono: '555-2000',
                email: 'contacto@importadoraglobal.com',
                creditoDias: 15,
            },
        }),
    ]);
    console.log('✅ Proveedores creados');
    // Crear unidades de medida
    const unidades = await Promise.all([
        prisma.unidadMedida.upsert({
            where: { codigo: 'PZA' },
            update: {},
            create: { codigo: 'PZA', nombre: 'Pieza', abreviatura: 'pza', tipo: 'pieza', factorConversion: 1.0 },
        }),
        prisma.unidadMedida.upsert({
            where: { codigo: 'CJA' },
            update: {},
            create: { codigo: 'CJA', nombre: 'Caja', abreviatura: 'cja', tipo: 'pieza', factorConversion: 1.0 },
        }),
        prisma.unidadMedida.upsert({
            where: { codigo: 'M' },
            update: {},
            create: { codigo: 'M', nombre: 'Metro', abreviatura: 'm', tipo: 'longitud', factorConversion: 1.0 },
        }),
        prisma.unidadMedida.upsert({
            where: { codigo: 'KG' },
            update: {},
            create: { codigo: 'KG', nombre: 'Kilogramo', abreviatura: 'kg', tipo: 'peso', factorConversion: 1.0 },
        }),
        prisma.unidadMedida.upsert({
            where: { codigo: 'L' },
            update: {},
            create: { codigo: 'L', nombre: 'Litro', abreviatura: 'L', tipo: 'volumen', factorConversion: 1.0 },
        }),
    ]);
    console.log('✅ Unidades de medida creadas');
    // Crear tipos de movimiento
    const tiposMovimiento = await Promise.all([
        prisma.tipoMovimiento.upsert({
            where: { codigo: 'COMPRA' },
            update: {},
            create: { codigo: 'COMPRA', nombre: 'Compra a Proveedor', afectaStock: 'ENTRADA', descripcion: 'Ingreso de mercancía por compra' },
        }),
        prisma.tipoMovimiento.upsert({
            where: { codigo: 'VENTA' },
            update: {},
            create: { codigo: 'VENTA', nombre: 'Venta', afectaStock: 'SALIDA', descripcion: 'Salida por venta a cliente' },
        }),
        prisma.tipoMovimiento.upsert({
            where: { codigo: 'MERMA' },
            update: {},
            create: { codigo: 'MERMA', nombre: 'Merma/Pérdida', afectaStock: 'SALIDA', descripcion: 'Pérdida por daño, robo o caducidad' },
        }),
        prisma.tipoMovimiento.upsert({
            where: { codigo: 'AJUSTE+' },
            update: {},
            create: { codigo: 'AJUSTE+', nombre: 'Ajuste Positivo', afectaStock: 'ENTRADA', descripcion: 'Ajuste de inventario por incremento' },
        }),
        prisma.tipoMovimiento.upsert({
            where: { codigo: 'AJUSTE-' },
            update: {},
            create: { codigo: 'AJUSTE-', nombre: 'Ajuste Negativo', afectaStock: 'SALIDA', descripcion: 'Ajuste de inventario por decremento' },
        }),
    ]);
    console.log('✅ Tipos de movimiento creados');
    // Crear ubicaciones
    const ubicaciones = await Promise.all([
        prisma.ubicacion.upsert({
            where: { codigo: 'A-01-01' },
            update: {},
            create: { codigo: 'A-01-01', pasillo: 'A', estante: '01', gaveta: '01', descripcion: 'Pasillo A, Estante 1, Gaveta 1' },
        }),
        prisma.ubicacion.upsert({
            where: { codigo: 'B-02-03' },
            update: {},
            create: { codigo: 'B-02-03', pasillo: 'B', estante: '02', gaveta: '03', descripcion: 'Pasillo B, Estante 2, Gaveta 3' },
        }),
    ]);
    console.log('✅ Ubicaciones creadas');
    // Crear productos de ejemplo
    const productos = await Promise.all([
        prisma.producto.upsert({
            where: { codigoInterno: 'HERR-001' },
            update: {},
            create: {
                codigoInterno: 'HERR-001',
                codigoBarra: '7501234567890',
                nombre: 'Martillo de Carpintero',
                descripcion: 'Martillo de carpintero con mango de fibra de vidrio',
                categoriaId: categorias[0].id,
                marcaId: marcas[0].id,
                proveedorPrincipalId: proveedores[0].id,
                unidadMedidaId: unidades[0].id,
                material: 'Acero y fibra de vidrio',
                costoPromedio: 15.00,
                precioVenta: 25.00,
                stockActual: 50,
                stockMinimo: 10,
                stockMaximo: 100,
                metodoCosteo: 'PROMEDIO',
            },
        }),
        prisma.producto.upsert({
            where: { codigoInterno: 'ELEC-001' },
            update: {},
            create: {
                codigoInterno: 'ELEC-001',
                codigoBarra: '7501234567891',
                nombre: 'Cable Eléctrico 12AWG',
                descripcion: 'Cable eléctrico THHN 12AWG, color negro',
                categoriaId: categorias[1].id,
                marcaId: marcas[2].id,
                proveedorPrincipalId: proveedores[0].id,
                unidadMedidaId: unidades[2].id,
                material: 'Cobre',
                medida: '12AWG',
                costoPromedio: 2.50,
                precioVenta: 4.00,
                stockActual: 500,
                stockMinimo: 100,
                stockMaximo: 1000,
                metodoCosteo: 'PROMEDIO',
            },
        }),
        prisma.producto.upsert({
            where: { codigoInterno: 'PLOM-001' },
            update: {},
            create: {
                codigoInterno: 'PLOM-001',
                codigoBarra: '7501234567892',
                nombre: 'Tubo PVC 1/2"',
                descripcion: 'Tubo PVC para desagüe 1/2 pulgada',
                categoriaId: categorias[2].id,
                marcaId: marcas[2].id,
                proveedorPrincipalId: proveedores[1].id,
                unidadMedidaId: unidades[2].id,
                material: 'PVC',
                medida: '1/2 pulgada',
                costoPromedio: 3.00,
                precioVenta: 5.50,
                stockActual: 200,
                stockMinimo: 50,
                stockMaximo: 500,
                metodoCosteo: 'PROMEDIO',
            },
        }),
        prisma.producto.upsert({
            where: { codigoInterno: 'TORN-001' },
            update: {},
            create: {
                codigoInterno: 'TORN-001',
                codigoBarra: '7501234567893',
                nombre: 'Tornillo 1/4" x 1"',
                descripcion: 'Tornillo cabeza hexagonal 1/4" x 1"',
                categoriaId: categorias[4].id,
                marcaId: marcas[0].id,
                proveedorPrincipalId: proveedores[0].id,
                unidadMedidaId: unidades[0].id,
                material: 'Acero',
                medida: '1/4" x 1"',
                costoPromedio: 0.15,
                precioVenta: 0.35,
                stockActual: 1000,
                stockMinimo: 200,
                stockMaximo: 2000,
                metodoCosteo: 'PROMEDIO',
            },
        }),
        prisma.producto.upsert({
            where: { codigoInterno: 'PINT-001' },
            update: {},
            create: {
                codigoInterno: 'PINT-001',
                codigoBarra: '7501234567894',
                nombre: 'Pintura Blanca Interior',
                descripcion: 'Pintura látex blanca para interior, galón',
                categoriaId: categorias[5].id,
                marcaId: marcas[2].id,
                proveedorPrincipalId: proveedores[1].id,
                unidadMedidaId: unidades[4].id,
                costoPromedio: 18.00,
                precioVenta: 32.00,
                stockActual: 30,
                stockMinimo: 10,
                stockMaximo: 60,
                metodoCosteo: 'PROMEDIO',
            },
        }),
    ]);
    console.log('✅ Productos de ejemplo creados');
    // Crear stock por sucursal para cada producto
    for (const producto of productos) {
        await prisma.stockSucursal.upsert({
            where: {
                productoId_sucursalId: {
                    productoId: producto.id,
                    sucursalId: sucursal.id,
                },
            },
            update: {},
            create: {
                productoId: producto.id,
                sucursalId: sucursal.id,
                cantidad: producto.stockActual,
                stockMinimo: producto.stockMinimo,
            },
        });
    }
    console.log('✅ Stock por sucursal creado');
    console.log('🎉 Seed completado exitosamente!');
}
main()
    .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
