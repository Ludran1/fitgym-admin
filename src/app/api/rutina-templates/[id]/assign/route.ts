import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { cliente_id, fecha_inicio, fecha_fin } = body
    if (!cliente_id) return NextResponse.json({ error: 'cliente_id es requerido' }, { status: 400 })

    // Obtener plantilla usando Prisma (incluye ejercicios)
    const template = await prisma.routineTemplates.findUnique({
      where: { id: params.id },
      include: { exercises: true },
    })
    if (!template) return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })

    // Crear rutina via Prisma (schema inglés)
    const rutina = await prisma.routines.create({
      data: {
        client_id: cliente_id,
        name: template.name,
        description: template.description ?? null,
        status: 'active',
        start_date: fecha_inicio ? new Date(fecha_inicio) : new Date(),
        end_date: fecha_fin ? new Date(fecha_fin) : null,
      },
    })

    // Insertar ejercicios en routine_exercises via Prisma
    if (template.exercises.length > 0) {
      await prisma.$transaction(
        template.exercises.map((e) =>
          prisma.routineExercises.create({
            data: {
              routine_id: rutina.id,
              name: e.name ?? 'Ejercicio',
              sets: e.sets ?? null,
              reps: e.repetitions ?? null,
              day: e.day ?? null,
              notes: e.notes ?? null,
              order: e.order ?? null,
            },
          }),
        ),
      )
    }

    return NextResponse.json(rutina)
  } catch (err) {
    console.error('POST /api/rutina-templates/[id]/assign error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}