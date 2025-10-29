import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// POST - Asignar plantilla a cliente (crear rutina)
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { id: template_id } = params;
        const { cliente_id } = body;

        // Obtener la plantilla con sus ejercicios
        const template = await prisma.rutina_templates.findUnique({
            where: { id: template_id },
            include: {
                rutina_template_ejercicios: true,
            },
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Plantilla no encontrada' },
                { status: 404 }
            );
        }

        // Crear la rutina para el cliente
        const rutina = await prisma.rutinas.create({
            data: {
                id: crypto.randomUUID(),
                cliente_id,
                nombre: template.nombre,
                descripcion: template.descripcion,
                estado: 'activa',
                fecha_inicio: new Date(),
                updated_at: new Date(),
            },
        });

        // Copiar los ejercicios de la plantilla a la rutina del cliente
        const ejerciciosPromises = template.rutina_template_ejercicios.map((te) =>
            prisma.rutina_ejercicios.create({
                data: {
                    id: crypto.randomUUID(),
                    rutina_id: rutina.id,
                    nombre: te.nombre || '',
                    sets: te.sets,
                    repeticiones: te.repeticiones,
                    dia: te.dia,
                    notas: te.notas,
                    orden: te.orden,
                },
            })
        );

        await Promise.all(ejerciciosPromises);

        return NextResponse.json({ ok: true, rutina });
    } catch (error) {
        console.error('Error al asignar rutina a cliente:', error);
        return NextResponse.json(
            { error: 'Error al asignar la rutina al cliente' },
            { status: 500 }
        );
    }
}
