import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const membresias = await prisma.memberships.findMany({
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json(membresias)
  } catch (err) {
    console.error('GET /api/membresias error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      nombre,
      descripcion,
      tipo,
      modalidad,
      precio,
      duracion,
      caracteristicas,
      activa,
    } = body

    if (!nombre || !tipo || !modalidad || !precio || !duracion) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const m = await prisma.memberships.create({
      data: {
        name: nombre,
        description: descripcion,
        type: tipo,
        mode: modalidad,
        price: precio,
        duration: duracion,
        features: caracteristicas ?? [],
        is_active: activa ?? true,
      },
    })
    return NextResponse.json(m, { status: 201 })
  } catch (err) {
    console.error('POST /api/membresias error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}