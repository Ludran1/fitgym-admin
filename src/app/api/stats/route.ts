import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [totalClientes, activas, vencidas, totalEventos] = await Promise.all([
      prisma.clients.count(),
      prisma.clients.count({ where: { status: 'active' } }),
      prisma.clients.count({ where: { status: 'expired' } }),
      prisma.events.count({ where: { status: 'scheduled' } }),
    ])

    const membershipCounts = await prisma.clients.groupBy({
      by: ['membership_id'],
      _count: { membership_id: true },
    })

    const today = new Date()
    const ahead = new Date()
    ahead.setDate(ahead.getDate() + 7)
    const expiring = await prisma.clients.findMany({
      where: {
        status: 'active',
        end_date: { gte: today, lte: ahead },
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        end_date: true,
        membership_name: true,
      },
      orderBy: { end_date: 'asc' },
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