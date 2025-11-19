import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export interface PersonaEnGym {
    id: string;
    clienteId: string;
    nombre: string;
    avatarUrl: string | null;
    horaEntrada: string;
    tiempoTranscurrido: number;
    tiempoEstimadoSalida: string;
}

export interface AforoData {
    aforoActual: {
        personasActuales: number;
        capacidadMaxima: number;
        porcentajeOcupacion: number;
        espaciosDisponibles: number;
        estado: 'disponible' | 'moderado' | 'lleno' | 'excedido';
        ultimaActualizacion: string;
    };
    personasEnGym: PersonaEnGym[];
    estadisticasHoy: {
        totalAsistencias: number;
        tiempoPromedioMinutos: number;
        picoAforo: {
            hora: string;
            cantidad: number;
        } | null;
    };
    configuracion: {
        capacidadMaxima: number;
        tiempoPromedioMinutos: number;
        alertaPorcentaje: number;
        horarioApertura: string;
        horarioCierre: string;
    };
}

/**
 * Obtener datos completos de aforo
 */
export const getAforoData = cache(async (): Promise<AforoData> => {
    const now = new Date();
    const hoyInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hoyFin = new Date(hoyInicio);
    hoyFin.setDate(hoyFin.getDate() + 1);

    // Obtener asistencias sin salida (personas actualmente en el gym)
    const personasActuales = await prisma.asistencias.findMany({
        where: {
            hora_salida: null,
            hora_entrada: {
                gte: hoyInicio,
                lt: hoyFin
            }
        },
        include: {
            clientes: {
                select: {
                    id: true,
                    nombre: true,
                    avatar_url: true
                }
            }
        },
        orderBy: {
            hora_entrada: 'desc'
        }
    });

    // Calcular tiempos
    const personasEnGym: PersonaEnGym[] = personasActuales.map(asistencia => {
        const tiempoTranscurrido = Math.floor(
            (now.getTime() - new Date(asistencia.hora_entrada).getTime()) / (1000 * 60)
        );
        const tiempoEstimado = new Date(asistencia.hora_entrada);
        tiempoEstimado.setMinutes(tiempoEstimado.getMinutes() + 90); // Estimado 90 min

        return {
            id: asistencia.id,
            clienteId: asistencia.cliente_id,
            nombre: asistencia.clientes?.nombre || 'Sin nombre',
            avatarUrl: asistencia.clientes?.avatar_url || null,
            horaEntrada: asistencia.hora_entrada.toISOString(),
            tiempoTranscurrido,
            tiempoEstimadoSalida: tiempoEstimado.toISOString()
        };
    });

    // Estadísticas del día
    const todasAsistenciasHoy = await prisma.asistencias.count({
        where: {
            hora_entrada: {
                gte: hoyInicio,
                lt: hoyFin
            }
        }
    });

    const asistenciasConSalida = await prisma.asistencias.findMany({
        where: {
            hora_entrada: {
                gte: hoyInicio,
                lt: hoyFin
            },
            hora_salida: { not: null },
            duracion_minutos: { not: null }
        },
        select: {
            duracion_minutos: true
        }
    });

    const tiempoPromedio = asistenciasConSalida.length > 0
        ? Math.round(
            asistenciasConSalida.reduce((acc, a) => acc + (a.duracion_minutos || 0), 0) / asistenciasConSalida.length
        )
        : 90;

    // Configuración (valores por defecto, podrías moverlos a una tabla de configuración)
    const capacidadMaxima = 50;
    const porcentajeOcupacion = (personasActuales.length / capacidadMaxima) * 100;
    const espaciosDisponibles = Math.max(0, capacidadMaxima - personasActuales.length);

    let estado: 'disponible' | 'moderado' | 'lleno' | 'excedido' = 'disponible';
    if (porcentajeOcupacion >= 100) estado = 'excedido';
    else if (porcentajeOcupacion >= 90) estado = 'lleno';
    else if (porcentajeOcupacion >= 70) estado = 'moderado';

    return {
        aforoActual: {
            personasActuales: personasActuales.length,
            capacidadMaxima,
            porcentajeOcupacion: Math.round(porcentajeOcupacion),
            espaciosDisponibles,
            estado,
            ultimaActualizacion: now.toISOString()
        },
        personasEnGym,
        estadisticasHoy: {
            totalAsistencias: todasAsistenciasHoy,
            tiempoPromedioMinutos: tiempoPromedio,
            picoAforo: null // TODO: Implementar cálculo de pico
        },
        configuracion: {
            capacidadMaxima,
            tiempoPromedioMinutos: 90,
            alertaPorcentaje: 80,
            horarioApertura: '06:00',
            horarioCierre: '22:00'
        }
    };
});

export function preloadAforoData() {
    void getAforoData();
}
