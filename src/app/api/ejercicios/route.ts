import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - Obtener todos los ejercicios
export async function GET() {
    try {
        const ejercicios = await prisma.ejercicios.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json({ ejercicios });
    } catch (error) {
        console.error('Error al obtener ejercicios:', error);
        return NextResponse.json(
            { error: 'Error al obtener los ejercicios' },
            { status: 500 }
        );
    }
}

// POST - Crear nuevo ejercicio
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Procesar músculos (puede venir como string separado por comas o array)
        let musculos: string[] = [];
        if (typeof body.musculos === 'string') {
            musculos = body.musculos
                .split(',')
                .map((m: string) => m.trim())
                .filter((m: string) => m.length > 0);
        } else if (Array.isArray(body.musculos)) {
            musculos = body.musculos;
        }

        const ejercicio = await prisma.ejercicios.create({
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

        return NextResponse.json(ejercicio, { status: 201 });
    } catch (error) {
        console.error('Error al crear ejercicio:', error);
        return NextResponse.json(
            { error: 'Error al crear el ejercicio' },
            { status: 500 }
        );
    }
}
