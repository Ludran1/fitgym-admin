import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const today = new Date()
    const threeDaysAhead = new Date()
    threeDaysAhead.setDate(threeDaysAhead.getDate() + 3)

    const [activos, porVencer, vencidos] = await Promise.all([
      prisma.clients.findMany({
        where: {
          status: 'active',
          OR: [
            { end_date: { gte: today } },
            { end_date: null },
          ],
        },
        select: { id: true, full_name: true, avatar_url: true, end_date: true, membership_name: true },
        orderBy: { full_name: 'asc' },
        take: 50,
      }),
      prisma.clients.findMany({
        where: {
          status: 'active',
          end_date: { gte: today, lte: threeDaysAhead },
        },
        select: { id: true, full_name: true, avatar_url: true, end_date: true, membership_name: true },
        orderBy: { end_date: 'asc' },
        take: 50,
      }),
      prisma.clients.findMany({
        where: {
          status: 'expired',
          OR: [
            { end_date: { lt: today } },
          ],
        },
        select: { id: true, full_name: true, avatar_url: true, end_date: true, membership_name: true },
        orderBy: { full_name: 'asc' },
        take: 50,
      }),
    ])

    return NextResponse.json({ activos, porVencer, vencidos })
  } catch (err) {
    console.error('GET /api/pagos/dashboard error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}