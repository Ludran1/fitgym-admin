import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const list = await prisma.asistencias.findMany({
      where: { evento_id: params.id },
      include: { cliente: true },
      orderBy: { fecha_asistencia: 'desc' },
    })
    return NextResponse.json(list)
  } catch (err) {
    console.error('GET /api/eventos/[id]/asistencias error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { cliente_id, estado, notas } = body
    if (!cliente_id) return NextResponse.json({ error: 'cliente_id requerido' }, { status: 400 })

    // Verificar capacidad del evento
    const ev = await prisma.eventos.findUnique({ where: { id: params.id } })
    if (!ev) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    const participantesActuales = ev.participantes_actuales ?? 0
    const maxParticipantes = ev.max_participantes ?? Number.MAX_SAFE_INTEGER
    if (participantesActuales >= maxParticipantes) {
      return NextResponse.json({ error: 'Evento sin cupos' }, { status: 409 })
    }

    const reg = await prisma.asistencias.create({
      data: {
        evento_id: params.id,
        cliente_id,
        estado: estado ?? 'presente',
        notas,
      },
    })
    return NextResponse.json(reg, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/eventos/[id]/asistencias error', err)
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Asistencia duplicada' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}