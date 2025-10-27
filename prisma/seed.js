/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({ log: ['warn', 'error'] })

async function main() {
  console.log('Seeding datos de desarrollo...')

  // Inserta membresías de ejemplo (tabla pública existente)
  await prisma.$executeRaw`INSERT INTO public.membresias (id, nombre, descripcion, tipo, modalidad, precio, duracion, caracteristicas, activa, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Mensual Libre', 'Acceso libre por 1 mes', 'mensual', 'libre', 120.00, 1, ARRAY['sin límite de asistencia'], true, NOW(), NOW())
    ON CONFLICT DO NOTHING`;

  await prisma.$executeRaw`INSERT INTO public.membresias (id, nombre, descripcion, tipo, modalidad, precio, duracion, caracteristicas, activa, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Interdiario', '3 días por semana', 'mensual', 'interdiario', 90.00, 1, ARRAY['máx 3 asistencias por semana'], true, NOW(), NOW())
    ON CONFLICT DO NOTHING`;

  // Inserta cliente de ejemplo
  const clienteIdRows = await prisma.$queryRaw`SELECT gen_random_uuid() as id`;
  const clienteId = clienteIdRows[0]?.id;
  await prisma.$executeRaw`INSERT INTO public.clientes (id, nombre, email, telefono, fecha_nacimiento, fecha_registro, estado, asistencias, created_at, updated_at)
    VALUES (${clienteId}, 'Juan Pérez', 'juan.perez@example.com', '+51999999999', DATE '1995-05-20', NOW(), 'activa', 0, NOW(), NOW())
    ON CONFLICT DO NOTHING`;

  // Inserta evento y asistencia de ejemplo
  const eventoIdRows = await prisma.$queryRaw`SELECT gen_random_uuid() as id`;
  const eventoId = eventoIdRows[0]?.id;
  await prisma.$executeRaw`INSERT INTO public.eventos (id, titulo, descripcion, fecha, hora, tipo, cliente_id, estado, created_at, updated_at)
    VALUES (${eventoId}, 'Sesión Libre', 'Acceso al gimnasio', CURRENT_DATE, TIME '10:00', 'libre', ${clienteId}, 'programado', NOW(), NOW())
    ON CONFLICT DO NOTHING`;

  await prisma.$executeRaw`INSERT INTO public.asistencias (id, evento_id, cliente_id, fecha_asistencia, estado, notas, created_at)
    VALUES (gen_random_uuid(), ${eventoId}, ${clienteId}, NOW(), 'presente', NULL, NOW())
    ON CONFLICT DO NOTHING`;

  console.log('Seed de desarrollo completado.')
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })