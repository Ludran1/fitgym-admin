import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function ensureRoutineTables() {
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.routines (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      client_id UUID NOT NULL REFERENCES public.clientes(id) ON UPDATE NO ACTION,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'active',
      start_date TIMESTAMPTZ,
      end_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.routine_exercises (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE ON UPDATE NO ACTION,
      name VARCHAR(255) NOT NULL,
      sets INT,
      reps INT,
      day VARCHAR(20),
      notes TEXT,
      "order" INT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE 'plpgsql'
  `)
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_routines_updated_at'
      ) THEN
        CREATE TRIGGER update_routines_updated_at
          BEFORE UPDATE ON public.routines
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END
    $$
  `)
}

// Listar rutinas, opcionalmente filtrando por client_id y status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const client_id = searchParams.get('cliente_id') ?? undefined
    const status = searchParams.get('estado') ?? undefined

    try {
      const rutinas = await prisma.routines.findMany({
        where: {
          ...(client_id ? { client_id } : {}),
          ...(status ? { status } : {}),
        },
        orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
        take: 100,
        include: { exercises: true },
      })
      return NextResponse.json(rutinas)
    } catch (e: any) {
      if (e?.code === 'P2021') {
        await ensureRoutineTables()
        const rutinas = await prisma.routines.findMany({
          where: {
            ...(client_id ? { client_id } : {}),
            ...(status ? { status } : {}),
          },
          orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
          take: 100,
          include: { exercises: true },
        })
        return NextResponse.json(rutinas)
      }
      throw e
    }
  } catch (err) {
    console.error('GET /api/rutinas error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Crear nueva rutina, opcionalmente con ejercicios
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      cliente_id,
      nombre,
      descripcion,
      estado = 'activa',
      fecha_inicio,
      fecha_fin,
      ejercicios = [],
    } = body

    if (!cliente_id || !nombre) {
      return NextResponse.json({ error: 'cliente_id y nombre son requeridos' }, { status: 400 })
    }

    const insertRutinaQuery = `INSERT INTO public.rutinas (cliente_id, nombre, descripcion, estado, fecha_inicio, fecha_fin)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, cliente_id, nombre, descripcion, estado, fecha_inicio, fecha_fin, created_at, updated_at`

    const inserted = await prisma.$queryRawUnsafe<any[]>(
      insertRutinaQuery,
      cliente_id,
      nombre,
      descripcion ?? null,
      estado ?? 'activa',
      fecha_inicio ? new Date(fecha_inicio) : null,
      fecha_fin ? new Date(fecha_fin) : null,
    )

    const rutina = inserted[0]

    // Insertar ejercicios si vienen en el body
    if (rutina && Array.isArray(ejercicios) && ejercicios.length > 0) {
      for (const e of ejercicios) {
        const {
          nombre: nombre_ejercicio,
          series,
          repeticiones,
          dia,
          notas,
          orden,
        } = e
        await prisma.$executeRawUnsafe(
          `INSERT INTO public.rutina_ejercicios (rutina_id, nombre, series, repeticiones, dia, notas, orden)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          rutina.id,
          nombre_ejercicio,
          series ?? null,
          repeticiones ?? null,
          dia ?? null,
          notas ?? null,
          orden ?? null,
        )
      }
    }

    // Devolver rutina con ejercicios
    const ejerciciosRows = await prisma.$queryRawUnsafe<any[]>(
      'SELECT id, rutina_id, nombre, series, repeticiones, dia, notas, orden FROM public.rutina_ejercicios WHERE rutina_id = $1 ORDER BY orden ASC NULLS LAST, id ASC',
      rutina.id,
    )

    return NextResponse.json({ ...rutina, ejercicios: ejerciciosRows }, { status: 201 })
  } catch (err) {
    console.error('POST /api/rutinas error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}