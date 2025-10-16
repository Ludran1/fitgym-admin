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
    const ev = await prisma.eventos.findUnique({
      where: { id: params.id },
      include: { cliente: true, asistencias: true },
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
    const fields = [
      'titulo',
      'descripcion',
      'fecha',
      'hora',
      'tipo',
      'cliente_id',
      'cliente_nombre',
      'entrenador',
      'duracion',
      'estado',
      'max_participantes',
      'precio',
      'notas',
    ]
    for (const f of fields) {
      if (body[f] !== undefined) {
        if (f === 'fecha') data[f] = new Date(body[f])
        else if (f === 'hora') data[f] = parseHora(body[f])
        else data[f] = body[f]
      }
    }

    const ev = await prisma.eventos.update({
      where: { id: params.id },
      data,
      include: { cliente: true },
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
    await prisma.eventos.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('DELETE /api/eventos/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}