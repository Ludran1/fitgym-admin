import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const list = await prisma.attendances.findMany({
      include: { event: true, client: true },
      orderBy: { attendance_date: 'desc' },
      take: 100,
    })
    return NextResponse.json(list)
  } catch (err) {
    console.error('GET /api/asistencias error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}