import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const list = await prisma.asistencias.findMany({
      include: { evento: true, cliente: true },
      orderBy: { fecha_asistencia: 'desc' },
      take: 100,
    })
    return NextResponse.json(list)
  } catch (err) {
    console.error('GET /api/asistencias error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}