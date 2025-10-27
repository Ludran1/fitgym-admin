import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}))
    const { membresia_id } = body

    const cliente = await prisma.clients.findUnique({
      where: { id: params.id },
      select: { id: true, membership_id: true }
    })
    if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const targetMembresiaId = membresia_id ?? cliente.membership_id
    if (!targetMembresiaId)
      return NextResponse.json({ error: 'Cliente sin membresía' }, { status: 400 })

    const m = await prisma.memberships.findUnique({
      where: { id: String(targetMembresiaId) },
      select: { id: true, duration: true }
    })
    if (!m) return NextResponse.json({ error: 'Membresía no encontrada' }, { status: 404 })

    const now = new Date()
    const fin = addMonths(now, m.duration)

    const updated = await prisma.clients.update({
      where: { id: params.id },
      data: {
        membership_id: m.id,
        start_date: now,
        end_date: fin,
        status: 'active',
      },
      include: { membership: true },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('POST /api/clientes/[id]/renovar error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}