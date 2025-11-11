import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface AsistenciaConCliente {
    id: string;
    cliente_id: string;
    fecha_asistencia: Date | string;
    hora_entrada: Date | string;
    hora_salida: Date | string | null;
    duracion_minutos: number | null;
    estado: string;
    notas: string | null;
    clientes: {
        id: string;
        nombre: string;
        dni: string | null;
        avatar_url: string | null;
        fecha_fin: Date | string | null;
    } | null;
}

interface RegistrarAsistenciaData {
    cliente_id: string;
    notas?: string;
}

// Query Keys
export const asistenciasKeys = {
    all: ['asistencias'] as const,
    lists: () => [...asistenciasKeys.all, 'list'] as const,
    list: (filters: { limit?: number; fecha?: string }) =>
        [...asistenciasKeys.lists(), filters] as const,
    detail: (id: string) => [...asistenciasKeys.all, 'detail', id] as const,
};

// Fetch asistencias
async function fetchAsistencias(filters: { limit?: number; fecha?: string } = {}): Promise<AsistenciaConCliente[]> {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.fecha) params.append('fecha', filters.fecha);

    const response = await fetch(`/api/asistencias?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Error al cargar asistencias');
    }
    return response.json();
}

// Registrar asistencia
async function registrarAsistencia(data: RegistrarAsistenciaData): Promise<AsistenciaConCliente> {
    const response = await fetch('/api/asistencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar asistencia');
    }

    return response.json();
}

// Hook: useAsistencias
export function useAsistenciasQuery(filters: { limit?: number; fecha?: string } = {}) {
    return useQuery({
        queryKey: asistenciasKeys.list(filters),
        queryFn: () => fetchAsistencias(filters),
        staleTime: 30 * 1000, // 30 segundos
        refetchInterval: 60 * 1000, // Refetch cada 60 segundos
    });
}

// Hook: useRegistrarAsistencia
export function useRegistrarAsistencia() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: registrarAsistencia,
        onSuccess: (newAsistencia) => {
            // Invalidar y refetch de asistencias
            queryClient.invalidateQueries({ queryKey: asistenciasKeys.lists() });

            // Optimistic update opcional
            queryClient.setQueryData<AsistenciaConCliente[]>(
                asistenciasKeys.list({ limit: 100 }),
                (old) => (old ? [newAsistencia, ...old] : [newAsistencia])
            );

            const hora = new Date(newAsistencia.fecha_asistencia).toTimeString().split(' ')[0];
            toast({
                title: 'Asistencia registrada',
                description: `${newAsistencia.clientes?.nombre} registró su asistencia a las ${hora}.`,
            });
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        },
    });
}
