import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const a = await prisma.attendances.findUnique({
      where: { id: params.id },
      include: { event: true, client: true },
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
    
    // Map Spanish request fields to English model fields
    const fieldMapping = {
      estado: 'status',
      notas: 'notes'
    }
    
    for (const [spanishField, englishField] of Object.entries(fieldMapping)) {
      if (body[spanishField] !== undefined) data[englishField] = body[spanishField]
    }
    
    const a = await prisma.attendances.update({ where: { id: params.id }, data })
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
    await prisma.attendances.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('DELETE /api/asistencias/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}