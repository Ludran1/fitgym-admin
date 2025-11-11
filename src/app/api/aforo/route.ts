import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/aforo - Obtener estadísticas de aforo actual
export async function GET() {
    try {
        const ahora = new Date();

        // Obtener configuración del gym
        let config = await prisma.configuracion_gym.findFirst();

        // Si no existe configuración, crear una por defecto
        if (!config) {
            const { randomUUID } = await import('crypto');
            config = await prisma.configuracion_gym.create({
                data: {
                    id: randomUUID(),
                    capacidad_maxima: 50,
                    tiempo_permanencia_promedio: 90, // 1.5 horas
                    alerta_aforo_porcentaje: 80,
                }
            });
        }

        // Definir inicio y fin del día actual
        const inicioDia = new Date();
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date();
        finDia.setHours(23, 59, 59, 999);

        // Calcular hora límite (tiempo promedio de permanencia hacia atrás) - solo para estimación
        const horaLimite = new Date(ahora.getTime() - (config.tiempo_permanencia_promedio * 60 * 1000));

        // Obtener asistencias activas DEL DÍA DE HOY
        // Consideramos "activos" a quienes:
        // 1. Registraron asistencia HOY (fecha_asistencia)
        // 2. No han registrado salida (hora_salida es null)
        // 3. O entraron hace menos del tiempo promedio (para auto-calcular salida estimada)
        const asistenciasActivas = await prisma.asistencias.findMany({
            where: {
                // Solo asistencias de hoy
                fecha_asistencia: {
                    gte: inicioDia,
                    lte: finDia
                },
                // Sin salida registrada
                hora_salida: null
            },
            include: {
                clientes: {
                    select: {
                        id: true,
                        nombre: true,
                        avatar_url: true,
                        estado: true,
                    }
                }
            },
            orderBy: {
                hora_entrada: 'desc'
            }
        });

        // Contar personas actualmente en el gym (todas las asistencias activas ya tienen hora_salida null)
        const personasActuales = asistenciasActivas.length;

        // Calcular porcentaje de ocupación
        const porcentajeOcupacion = Math.round((personasActuales / config.capacidad_maxima) * 100);

        // Determinar estado del aforo
        let estadoAforo: 'disponible' | 'moderado' | 'lleno' | 'excedido' = 'disponible';
        if (porcentajeOcupacion >= 100) {
            estadoAforo = 'excedido';
        } else if (porcentajeOcupacion >= config.alerta_aforo_porcentaje) {
            estadoAforo = 'lleno';
        } else if (porcentajeOcupacion >= 50) {
            estadoAforo = 'moderado';
        }

        // Estadísticas de hoy (reusar las variables inicioDia y finDia)
        const asistenciasHoy = await prisma.asistencias.count({
            where: {
                fecha_asistencia: {
                    gte: inicioDia,
                    lte: finDia
                }
            }
        });

        // Calcular tiempo promedio de permanencia hoy (solo de quienes ya salieron)
        const asistenciasCompletasHoy = await prisma.asistencias.findMany({
            where: {
                fecha_asistencia: {
                    gte: inicioDia,
                    lte: finDia
                },
                hora_salida: {
                    not: null
                }
            },
            select: {
                duracion_minutos: true
            }
        });

        const tiempoPromedioHoy = asistenciasCompletasHoy.length > 0
            ? Math.round(
                asistenciasCompletasHoy.reduce((sum, a) => sum + (a.duracion_minutos || 0), 0) /
                asistenciasCompletasHoy.length
            )
            : config.tiempo_permanencia_promedio;

        // Pico de aforo hoy (buscar hora con más asistencias)
        const asistenciasPorHora = await prisma.$queryRaw<Array<{ hora: number; cantidad: number }>>`
            SELECT 
                EXTRACT(HOUR FROM hora_entrada)::integer as hora,
                COUNT(*)::integer as cantidad
            FROM asistencias
            WHERE fecha_asistencia >= ${inicioDia}
            AND fecha_asistencia <= ${finDia}
            GROUP BY EXTRACT(HOUR FROM hora_entrada)
            ORDER BY cantidad DESC
            LIMIT 1
        `;

        const picoAforo = asistenciasPorHora.length > 0
            ? {
                hora: `${asistenciasPorHora[0].hora}:00`,
                cantidad: asistenciasPorHora[0].cantidad
            }
            : null;

        return NextResponse.json({
            aforoActual: {
                personasActuales,
                capacidadMaxima: config.capacidad_maxima,
                porcentajeOcupacion,
                espaciosDisponibles: Math.max(0, config.capacidad_maxima - personasActuales),
                estado: estadoAforo,
                ultimaActualizacion: ahora.toISOString()
            },
            personasEnGym: asistenciasActivas
                .filter(a => a.hora_salida === null)
                .map(a => ({
                    id: a.id,
                    clienteId: a.cliente_id,
                    nombre: a.clientes.nombre,
                    avatarUrl: a.clientes.avatar_url,
                    horaEntrada: a.hora_entrada,
                    tiempoTranscurrido: Math.round((ahora.getTime() - a.hora_entrada.getTime()) / (1000 * 60)), // minutos
                    tiempoEstimadoSalida: new Date(a.hora_entrada.getTime() + (config!.tiempo_permanencia_promedio * 60 * 1000))
                })),
            estadisticasHoy: {
                totalAsistencias: asistenciasHoy,
                tiempoPromedioMinutos: tiempoPromedioHoy,
                picoAforo,
            },
            configuracion: {
                capacidadMaxima: config.capacidad_maxima,
                tiempoPromedioMinutos: config.tiempo_permanencia_promedio,
                alertaPorcentaje: config.alerta_aforo_porcentaje,
                horarioApertura: config.horario_apertura,
                horarioCierre: config.horario_cierre,
            }
        });

    } catch (error: any) {
        console.error('Error obteniendo aforo:', error);
        return NextResponse.json(
            { error: 'Error al obtener aforo', details: error.message },
            { status: 500 }
        );
    }
}
