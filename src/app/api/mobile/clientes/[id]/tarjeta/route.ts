import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        id: string
        cliente_id: string
        codigo: string
        estado: string | null
        ultima_entrada: Date | null
        created_at: Date | null
        updated_at: Date | null
      }>
    >`SELECT id, cliente_id, codigo, estado, ultima_entrada, created_at, updated_at FROM public.tarjetas_acceso WHERE cliente_id = ${params.id} LIMIT 1`;

    const tarjeta = rows[0]

    if (!tarjeta)
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })

    return NextResponse.json(tarjeta)
  } catch (err) {
    console.error('GET /api/mobile/clientes/[id]/tarjeta error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}