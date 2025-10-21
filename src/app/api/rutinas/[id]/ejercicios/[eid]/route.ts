import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Actualizar ejercicio dentro de una rutina
export async function PUT(
  req: Request,
  { params }: { params: { id: string; eid: string } }
) {
  try {
    const body = await req.json()
    const {
      nombre,
      series,
      repeticiones,
      dia,
      notas,
      orden,
    } = body

    const updateQuery = `UPDATE public.rutina_ejercicios
      SET nombre = COALESCE($1, nombre),
          series = COALESCE($2, series),
          repeticiones = COALESCE($3, repeticiones),
          dia = COALESCE($4, dia),
          notas = COALESCE($5, notas),
          orden = COALESCE($6, orden)
      WHERE id = $7 AND rutina_id = $8
      RETURNING id, rutina_id, nombre, series, repeticiones, dia, notas, orden`

    const rows = await prisma.$queryRawUnsafe<any[]>(
      updateQuery,
      nombre ?? null,
      series ?? null,
      repeticiones ?? null,
      dia ?? null,
      notas ?? null,
      orden ?? null,
      params.eid,
      params.id,
    )

    const updated = rows[0]
    if (!updated) return NextResponse.json({ error: 'Ejercicio no encontrado' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('PUT /api/rutinas/[id]/ejercicios/[eid] error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Eliminar ejercicio dentro de una rutina
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; eid: string } }
) {
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      'DELETE FROM public.rutina_ejercicios WHERE id = $1 AND rutina_id = $2 RETURNING id',
      params.eid,
      params.id,
    )

    if (!rows[0]) return NextResponse.json({ error: 'Ejercicio no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/rutinas/[id]/ejercicios/[eid] error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}