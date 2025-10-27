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

    const existing = await prisma.routineExercises.findFirst({
      where: { id: params.eid, routine_id: params.id },
    })
    if (!existing)
      return NextResponse.json({ error: 'Ejercicio no encontrado' }, { status: 404 })

    const data: any = {}
    if (nombre !== undefined) data.name = nombre
    if (series !== undefined) data.sets = series
    if (repeticiones !== undefined) data.reps = repeticiones
    if (dia !== undefined) data.day = dia
    if (notas !== undefined) data.notes = notas
    if (orden !== undefined) data.order = orden

    const updated = await prisma.routineExercises.update({
      where: { id: params.eid },
      data,
    })

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