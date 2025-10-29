import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// DELETE - Eliminar ejercicio de plantilla
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; ejercicioId: string } }
) {
    try {
        const { ejercicioId } = params;

        await prisma.rutina_template_ejercicios.delete({
            where: { id: ejercicioId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar ejercicio de plantilla:', error);
        return NextResponse.json(
            { error: 'Error al eliminar el ejercicio de la plantilla' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar ejercicio de plantilla
export async function PUT(
    request: Request,
    { params }: { params: { id: string; ejercicioId: string } }
) {
    try {
        const body = await request.json();
        const { ejercicioId } = params;

        const ejercicio = await prisma.rutina_template_ejercicios.update({
            where: { id: ejercicioId },
            data: {
                nombre: body.nombre || null,
                sets: body.series || null,
                repeticiones: body.repeticiones || null,
                peso_sugerido: body.peso_sugerido ? Number(body.peso_sugerido) : null,
                dia: body.dia || null,
                notas: body.notas || null,
                orden: body.orden || null,
            },
        });

        return NextResponse.json(ejercicio);
    } catch (error) {
        console.error('Error al actualizar ejercicio de plantilla:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el ejercicio de la plantilla' },
            { status: 500 }
        );
    }
}
