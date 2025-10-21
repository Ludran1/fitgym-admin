import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Listar rutinas, opcionalmente filtrando por cliente_id y estado
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cliente_id = searchParams.get('cliente_id')
    const estado = searchParams.get('estado')

    let query = 'SELECT id, cliente_id, nombre, descripcion, estado, fecha_inicio, fecha_fin, created_at, updated_at FROM public.rutinas'
    const conditions: string[] = []
    const params: any[] = []

    if (cliente_id) {
      conditions.push(`cliente_id = $${params.length + 1}`)
      params.push(cliente_id)
    }
    if (estado) {
      conditions.push(`estado = $${params.length + 1}`)
      params.push(estado)
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    query += ' ORDER BY updated_at DESC NULLS LAST, created_at DESC'

    const rutinas = await prisma.$queryRawUnsafe<any[]>(query, ...params)
    return NextResponse.json(rutinas)
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