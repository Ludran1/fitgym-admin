import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const list = await prisma.attendances.findMany({
      where: { event_id: params.id },
      include: { client: true },
      orderBy: { attendance_date: 'desc' },
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
    const ev = await prisma.events.findUnique({ where: { id: params.id } })
    if (!ev) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    const participantesActuales = ev.current_participants ?? 0
    const maxParticipantes = ev.max_participants ?? Number.MAX_SAFE_INTEGER
    if (participantesActuales >= maxParticipantes) {
      return NextResponse.json({ error: 'Evento sin cupos' }, { status: 409 })
    }

    const reg = await prisma.attendances.create({
      data: {
        event_id: params.id,
        client_id: cliente_id,
        status: estado ?? 'presente',
        notes: notas,
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