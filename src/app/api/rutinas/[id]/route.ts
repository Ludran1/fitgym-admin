import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Obtener rutina por id (incluye ejercicios)
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rutinaRows = await prisma.$queryRawUnsafe<any[]>(
      'SELECT id, cliente_id, nombre, descripcion, estado, fecha_inicio, fecha_fin, created_at, updated_at FROM public.rutinas WHERE id = $1 LIMIT 1',
      params.id,
    )
    const rutina = rutinaRows[0]

    if (!rutina) {
      return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 })
    }

    const ejercicios = await prisma.$queryRawUnsafe<any[]>(
      'SELECT id, rutina_id, nombre, series, repeticiones, dia, notas, orden FROM public.rutina_ejercicios WHERE rutina_id = $1 ORDER BY orden ASC NULLS LAST, id ASC',
      rutina.id,
    )

    return NextResponse.json({ ...rutina, ejercicios })
  } catch (err) {
    console.error('GET /api/rutinas/[id] error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Actualizar rutina por id (campos opcionales)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const {
      nombre,
      descripcion,
      estado,
      fecha_inicio,
      fecha_fin,
    } = body

    const updateQuery = `UPDATE public.rutinas
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          estado = COALESCE($3, estado),
          fecha_inicio = COALESCE($4, fecha_inicio),
          fecha_fin = COALESCE($5, fecha_fin),
          updated_at = NOW()
      WHERE id = $6
      RETURNING id, cliente_id, nombre, descripcion, estado, fecha_inicio, fecha_fin, created_at, updated_at`

    const updatedRows = await prisma.$queryRawUnsafe<any[]>(
      updateQuery,
      nombre ?? null,
      descripcion ?? null,
      estado ?? null,
      fecha_inicio ? new Date(fecha_inicio) : null,
      fecha_fin ? new Date(fecha_fin) : null,
      params.id,
    )

    const updated = updatedRows[0]
    if (!updated) return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PUT /api/rutinas/[id] error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Eliminar rutina por id (borra ejercicios primero por seguridad)
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$executeRawUnsafe('DELETE FROM public.rutina_ejercicios WHERE rutina_id = $1', params.id)
    const delRows = await prisma.$queryRawUnsafe<any[]>(
      'DELETE FROM public.rutinas WHERE id = $1 RETURNING id',
      params.id,
    )
    if (!delRows[0]) return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/rutinas/[id] error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}