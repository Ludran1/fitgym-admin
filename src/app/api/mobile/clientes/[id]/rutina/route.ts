import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rutinaRows = await prisma.$queryRaw<
      Array<{
        id: string
        cliente_id: string
        nombre: string
        descripcion: string | null
        estado: string | null
        fecha_inicio: Date | null
        fecha_fin: Date | null
        updated_at: Date | null
      }>
    >`SELECT id, cliente_id, nombre, descripcion, estado, fecha_inicio, fecha_fin, updated_at FROM public.rutinas WHERE cliente_id = ${params.id} AND estado = 'activa' ORDER BY updated_at DESC LIMIT 1`;
    const rutina = rutinaRows[0]

    if (!rutina)
      return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 })

    const ejercicios = await prisma.$queryRaw<
      Array<{
        id: string
        rutina_id: string
        nombre: string
        series: number | null
        repeticiones: number | null
        dia: string | null
        notas: string | null
        orden: number | null
      }>
    >`SELECT id, rutina_id, nombre, series, repeticiones, dia, notas, orden FROM public.rutina_ejercicios WHERE rutina_id = ${rutina.id} ORDER BY orden ASC NULLS LAST, id ASC`;

    const payload = {
      id: rutina.id,
      cliente_id: rutina.cliente_id,
      nombre: rutina.nombre,
      descripcion: rutina.descripcion ?? null,
      estado: rutina.estado ?? 'activa',
      fecha_inicio: rutina.fecha_inicio ?? null,
      fecha_fin: rutina.fecha_fin ?? null,
      ejercicios: ejercicios.map(e => ({
        id: e.id,
        nombre: e.nombre,
        series: e.series ?? null,
        repeticiones: e.repeticiones ?? null,
        dia: e.dia ?? null,
        notas: e.notas ?? null,
        orden: e.orden ?? null,
      })),
    }

    return NextResponse.json(payload)
  } catch (err) {
    console.error('GET /api/mobile/clientes/[id]/rutina error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}