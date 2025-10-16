import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()

    const clientes = await prisma.clientes.findMany({
      where: q
        ? {
            OR: [
              { nombre: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { telefono: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      take: 50,
      orderBy: { created_at: 'desc' },
      include: { membresia: true },
    })

    return NextResponse.json(clientes)
  } catch (err) {
    console.error('GET /api/clientes error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      nombre,
      email,
      telefono,
      dni,
      fecha_nacimiento,
      membresia_id,
      fecha_inicio,
    } = body

    if (!nombre || !email || !telefono || !fecha_nacimiento) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const cliente = await prisma.clientes.create({
      data: {
        nombre,
        email,
        telefono,
        dni,
        fecha_nacimiento: new Date(fecha_nacimiento),
        membresia_id: membresia_id ?? null,
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
      },
      include: { membresia: true },
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/clientes error', err)
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email o DNI ya existe' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}