import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const a = await prisma.asistencias.findUnique({
      where: { id: params.id },
      include: { evento: true, cliente: true },
    })
    if (!a) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(a)
  } catch (err) {
    console.error('GET /api/asistencias/[id] error', err)
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
    const fields = ['estado', 'notas']
    for (const f of fields) if (body[f] !== undefined) data[f] = body[f]
    const a = await prisma.asistencias.update({ where: { id: params.id }, data })
    return NextResponse.json(a)
  } catch (err: any) {
    console.error('PUT /api/asistencias/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.asistencias.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('DELETE /api/asistencias/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}