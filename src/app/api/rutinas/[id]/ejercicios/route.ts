import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Agregar ejercicio a una rutina específica
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
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

    if (!nombre) {
      return NextResponse.json({ error: 'nombre es requerido' }, { status: 400 })
    }

    const insertQuery = `INSERT INTO public.rutina_ejercicios (rutina_id, nombre, series, repeticiones, dia, notas, orden)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, rutina_id, nombre, series, repeticiones, dia, notas, orden`

    const rows = await prisma.$queryRawUnsafe<any[]>(
      insertQuery,
      params.id,
      nombre,
      series ?? null,
      repeticiones ?? null,
      dia ?? null,
      notas ?? null,
      orden ?? null,
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error('POST /api/rutinas/[id]/ejercicios error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}