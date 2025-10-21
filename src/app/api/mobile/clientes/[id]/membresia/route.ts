import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function daysRemaining(fin?: Date | null) {
  if (!fin) return null
  const now = new Date()
  const diffMs = fin.getTime() - now.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return days < 0 ? 0 : days
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cliente = await prisma.clientes.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nombre: true,
        estado: true,
        fecha_inicio: true,
        fecha_fin: true,
        nombre_membresia: true,
        tipo_membresia: true,
        membresia: {
          select: {
            id: true,
            nombre: true,
            modalidad: true,
            precio: true,
            duracion: true,
          },
        },
      },
    })
    if (!cliente)
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const payload = {
      cliente_id: cliente.id,
      nombre: cliente.nombre,
      estado: cliente.estado ?? 'activa',
      fecha_inicio: cliente.fecha_inicio ?? null,
      fecha_fin: cliente.fecha_fin ?? null,
      nombre_membresia: cliente.nombre_membresia ?? cliente.membresia?.nombre ?? null,
      tipo_membresia: cliente.tipo_membresia ?? null,
      membresia: cliente.membresia ?? null,
      days_remaining: daysRemaining(cliente.fecha_fin ?? null),
    }

    return NextResponse.json(payload)
  } catch (err) {
    console.error('GET /api/mobile/clientes/[id]/membresia error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}