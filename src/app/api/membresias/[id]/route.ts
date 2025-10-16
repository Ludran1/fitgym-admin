import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const m = await prisma.membresias.findUnique({ where: { id: params.id } })
    if (!m) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(m)
  } catch (err) {
    console.error('GET /api/membresias/[id] error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const data: any = {}
    const fields = [
      'nombre',
      'descripcion',
      'tipo',
      'modalidad',
      'precio',
      'duracion',
      'caracteristicas',
      'activa',
    ]
    for (const f of fields) if (body[f] !== undefined) data[f] = body[f]

    const m = await prisma.membresias.update({ where: { id: params.id }, data })
    return NextResponse.json(m)
  } catch (err: any) {
    console.error('PUT /api/membresias/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.membresias.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('DELETE /api/membresias/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}