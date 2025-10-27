import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Registrar pago y extender membresía automáticamente
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}))
    const overrideMembresiaId: string | undefined = body?.membresia_id

    // Obtener cliente actual
    const cliente = await prisma.clients.findUnique({ where: { id: params.id } })
    if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    // Determinar membresía a usar
    const membresiaId = overrideMembresiaId ?? cliente.membership_id
    if (!membresiaId) {
      return NextResponse.json({ error: 'El cliente no tiene membresía asignada' }, { status: 400 })
    }

    const membership = await prisma.memberships.findUnique({ where: { id: membresiaId } })
    if (!membership) return NextResponse.json({ error: 'Membresía no encontrada' }, { status: 404 })

    const duracionMeses = membership.duration || 1

    // Calcular nueva fecha fin: desde hoy si vencida, desde end_date si aún activa
    const hoy = new Date()
    const base = cliente.end_date && cliente.end_date > hoy ? cliente.end_date : hoy
    const nuevaFin = new Date(base)
    nuevaFin.setMonth(nuevaFin.getMonth() + duracionMeses)

    const updated = await prisma.clients.update({
      where: { id: cliente.id },
      data: {
        membership_id: membresiaId,
        membership_name: membership.name,
        membership_type: membership.type,
        end_date: nuevaFin,
        status: 'active',
        updated_at: new Date(),
      },
    })

    return NextResponse.json({ ok: true, cliente: updated, nueva_fin: nuevaFin.toISOString() })
  } catch (err) {
    console.error('POST /api/clientes/[id]/pago error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}