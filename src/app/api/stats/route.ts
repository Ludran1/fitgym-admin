import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [totalClientes, activas, vencidas, totalEventos] = await Promise.all([
      prisma.clientes.count(),
      prisma.clientes.count({ where: { estado: 'activa' } }),
      prisma.clientes.count({ where: { estado: 'vencida' } }),
      prisma.eventos.count({ where: { estado: 'programado' } }),
    ])

    const membershipCounts = await prisma.clientes.groupBy({
      by: ['membresia_id'],
      _count: { membresia_id: true },
    })

    const today = new Date()
    const ahead = new Date()
    ahead.setDate(ahead.getDate() + 7)
    const expiring = await prisma.clientes.findMany({
      where: {
        estado: 'activa',
        fecha_fin: { gte: today, lte: ahead },
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        fecha_fin: true,
        nombre_membresia: true,
      },
      orderBy: { fecha_fin: 'asc' },
      take: 10,
    })

    return NextResponse.json({
      clientes: { total: totalClientes, activas, vencidas },
      eventos: { programados: totalEventos },
      membresias: membershipCounts,
      expiring,
    })
  } catch (err) {
    console.error('GET /api/stats error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}