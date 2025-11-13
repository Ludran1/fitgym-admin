import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - Obtener todas las membresías
export async function GET() {
    try {
        // Obtener todas las membresías
        const membresias = await prisma.membresias.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });

        // Calcular cantidad de clientes activos por membresía (estado != 'suspendida' y con membresia asignada)
        const counts = await prisma.clientes.groupBy({
            by: ['membresia_id'],
            _count: {
                id: true,
            },
            where: {
                membresia_id: { not: null },
                estado: { not: 'suspendida' },
            },
        });

        const mapCounts: Record<string, number> = {};
        counts.forEach(c => {
            if (c.membresia_id) mapCounts[c.membresia_id] = c._count.id;
        });

        // Aplanar el campo `clientes_activos` usando el conteo calculado (fallback 0)
        const membresiasWithCounts = membresias.map(m => ({
            ...m,
            clientes_activos: mapCounts[m.id] ?? 0,
        }));

        return NextResponse.json(membresiasWithCounts);
    } catch (error) {
        console.error('Error al obtener membresías:', error);
        return NextResponse.json(
            { error: 'Error al obtener las membresías' },
            { status: 500 }
        );
    }
}

// POST - Crear nueva membresía
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const membresia = await prisma.membresias.create({
            data: {
                nombre: body.nombre,
                descripcion: body.descripcion,
                tipo: body.tipo,
                modalidad: body.modalidad,
                precio: body.precio,
                duracion: body.duracion,
                caracteristicas: body.caracteristicas || [],
                activa: body.activa ?? true,
            },
        });

        return NextResponse.json(membresia, { status: 201 });
    } catch (error) {
        console.error('Error al crear membresía:', error);
        return NextResponse.json(
            { error: 'Error al crear la membresía' },
            { status: 500 }
        );
    }
}
