import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// POST - Agregar ejercicio a plantilla
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { id: template_id } = params;

        const ejercicio = await prisma.rutina_template_ejercicios.create({
            data: {
                id: crypto.randomUUID(),
                template_id,
                ejercicio_id: body.ejercicio_id || null,
                nombre: body.nombre || null,
                sets: body.series || null,
                repeticiones: body.repeticiones || null,
                peso_sugerido: body.peso_sugerido ? Number(body.peso_sugerido) : null,
                dia: body.dia || null,
                notas: body.notas || null,
                orden: body.orden || null,
            },
        });

        return NextResponse.json(ejercicio, { status: 201 });
    } catch (error) {
        console.error('Error al agregar ejercicio a plantilla:', error);
        return NextResponse.json(
            { error: 'Error al agregar el ejercicio a la plantilla' },
            { status: 500 }
        );
    }
}
