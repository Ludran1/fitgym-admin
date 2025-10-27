import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Obtener rutina por id (incluye ejercicios)
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rutina = await prisma.routines.findUnique({
      where: { id: params.id },
      include: { exercises: true },
    })

    if (!rutina) {
      return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 })
    }

    return NextResponse.json(rutina)
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
    const data: any = {}
    if (body.nombre !== undefined) data.name = body.nombre
    if (body.descripcion !== undefined) data.description = body.descripcion
    if (body.estado !== undefined) data.status = body.estado
    if (body.fecha_inicio !== undefined)
      data.start_date = body.fecha_inicio ? new Date(body.fecha_inicio) : null
    if (body.fecha_fin !== undefined)
      data.end_date = body.fecha_fin ? new Date(body.fecha_fin) : null

    const updated = await prisma.routines.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('PUT /api/rutinas/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 })
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