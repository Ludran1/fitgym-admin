import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// PUT - Actualizar ejercicio
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { id } = params;

        // Procesar músculos
        let musculos: string[] = [];
        if (typeof body.musculos === 'string') {
            musculos = body.musculos
                .split(',')
                .map((m: string) => m.trim())
                .filter((m: string) => m.length > 0);
        } else if (Array.isArray(body.musculos)) {
            musculos = body.musculos;
        }

        const ejercicio = await prisma.ejercicios.update({
            where: { id },
            data: {
                nombre: body.nombre,
                categoria: body.categoria || null,
                dificultad: body.dificultad || null,
                musculos: musculos,
                descripcion: body.descripcion || null,
                imagen_url: body.imagen_url || null,
                video_url: body.video_url || null,
            },
        });

        return NextResponse.json(ejercicio);
    } catch (error) {
        console.error('Error al actualizar ejercicio:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el ejercicio' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar ejercicio
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        await prisma.ejercicios.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar ejercicio:', error);
        return NextResponse.json(
            { error: 'Error al eliminar el ejercicio' },
            { status: 500 }
        );
    }
}
