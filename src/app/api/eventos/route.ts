import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function parseHora(hora?: string) {
  if (!hora) return null
  // Convierte "HH:MM" a Date en UTC para columna TIME
  return new Date(`1970-01-01T${hora}:00Z`)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const tipo = searchParams.get('tipo')

    const eventos = await prisma.events.findMany({
      where: {
        AND: [
          from ? { date: { gte: new Date(from) } } : {},
          to ? { date: { lte: new Date(to) } } : {},
          tipo ? { type: tipo } : {},
        ],
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      include: { client: true },
      take: 100,
    })
    return NextResponse.json(eventos)
  } catch (err) {
    console.error('GET /api/eventos error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      titulo,
      descripcion,
      fecha,
      hora,
      tipo,
      cliente_id,
      cliente_nombre,
      entrenador,
      duracion,
      estado,
      max_participantes,
      precio,
      notas,
    } = body

    if (!titulo || !fecha || !hora || !tipo) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const ev = await prisma.events.create({
      data: {
        title: titulo,
        description: descripcion,
        date: new Date(fecha),
        time: parseHora(hora)!,
        type: tipo,
        client_id: cliente_id ?? null,
        client_name: cliente_nombre,
        trainer: entrenador,
        duration: duracion ?? 60,
        status: estado ?? 'scheduled',
        max_participants: max_participantes ?? 1,
        price: precio,
        notes: notas,
      },
      include: { client: true },
    })
    return NextResponse.json(ev, { status: 201 })
  } catch (err) {
    console.error('POST /api/eventos error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}