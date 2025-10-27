import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function parseHora(hora?: string) {
  if (!hora) return null
  return new Date(`1970-01-01T${hora}:00Z`)
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ev = await prisma.events.findUnique({
      where: { id: params.id },
      include: { client: true, attendances: true },
    })
    if (!ev) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(ev)
  } catch (err) {
    console.error('GET /api/eventos/[id] error', err)
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
      titulo: 'title',
      descripcion: 'description',
      fecha: 'date',
      hora: 'time',
      tipo: 'type',
      cliente_id: 'client_id',
      cliente_nombre: 'client_name',
      entrenador: 'trainer',
      duracion: 'duration',
      estado: 'status',
      max_participantes: 'max_participants',
      precio: 'price',
      notas: 'notes',
    }
    
    for (const [spanishField, englishField] of Object.entries(fieldMapping)) {
      if (body[spanishField] !== undefined) {
        if (spanishField === 'fecha') data[englishField] = new Date(body[spanishField])
        else if (spanishField === 'hora') data[englishField] = parseHora(body[spanishField])
        else data[englishField] = body[spanishField]
      }
    }

    const ev = await prisma.events.update({
      where: { id: params.id },
      data,
      include: { client: true },
    })
    return NextResponse.json(ev)
  } catch (err: any) {
    console.error('PUT /api/eventos/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.events.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('DELETE /api/eventos/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}