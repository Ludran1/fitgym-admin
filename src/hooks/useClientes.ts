import { useState, useEffect } from 'react';

export interface Cliente {
    id: string;
    nombre: string;
    dni: string | null;
    email: string;
    telefono: string;
    fecha_nacimiento: Date | string;
    membresia_id: string | null;
    nombre_membresia: string | null;
    tipo_membresia: string | null;
    fecha_inicio: Date | string | null;
    fecha_fin: Date | string | null;
    estado: string;
    avatar_url: string | null;
}

export const useClientes = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadClientes = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/clientes');
                if (!response.ok) {
                    throw new Error('Error al cargar clientes');
                }
                const data = await response.json();
                setClientes(data);
                setError(null);
            } catch (err) {
                setError(err as Error);
                console.error('Error cargando clientes:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadClientes();
    }, []);

    return { clientes, isLoading, error };
};
