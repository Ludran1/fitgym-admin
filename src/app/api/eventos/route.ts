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

    const eventos = await prisma.eventos.findMany({
      where: {
        AND: [
          from ? { fecha: { gte: new Date(from) } } : {},
          to ? { fecha: { lte: new Date(to) } } : {},
          tipo ? { tipo } : {},
        ],
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
      include: { cliente: true },
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

    const ev = await prisma.eventos.create({
      data: {
        titulo,
        descripcion,
        fecha: new Date(fecha),
        hora: parseHora(hora)!,
        tipo,
        cliente_id: cliente_id ?? null,
        cliente_nombre,
        entrenador,
        duracion: duracion ?? 60,
        estado: estado ?? 'programado',
        max_participantes: max_participantes ?? 1,
        precio,
        notas,
      },
      include: { cliente: true },
    })
    return NextResponse.json(ev, { status: 201 })
  } catch (err) {
    console.error('POST /api/eventos error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}