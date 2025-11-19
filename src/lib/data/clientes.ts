import 'server-only';
import { cache } from 'react';
import prisma from '@/lib/prisma';
import type { clientes } from '@prisma/client';

/**
 * Función cacheada para obtener todos los clientes
 * Se usa cache() de React para memoizar requests duplicados durante el render
 * Solo disponible en el servidor (server-only)
 */
export const getClientes = cache(async (): Promise<clientes[]> => {
    try {
        const clientes = await prisma.clientes.findMany({
            where: {
                deleted_at: null, // Solo clientes activos
            },
            include: {
                membresias: {
                    select: {
                        nombre: true,
                        tipo: true,
                        modalidad: true,
                        precio: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return clientes;
    } catch (error) {
        console.error('Error fetching clientes:', error);
        throw new Error('No se pudieron cargar los clientes');
    }
});

/**
 * Patrón preload para iniciar la carga de datos antes de que se necesiten
 * Útil para cargar datos en paralelo con otras operaciones
 */
export const preloadClientes = () => {
    void getClientes();
};

/**
 * Obtener un cliente específico por ID
 */
export const getClienteById = cache(async (id: string): Promise<clientes | null> => {
    try {
        const cliente = await prisma.clientes.findUnique({
            where: { id },
            include: {
                membresias: {
                    select: {
                        nombre: true,
                        tipo: true,
                        modalidad: true,
                        precio: true,
                    },
                },
            },
        });

        return cliente;
    } catch (error) {
        console.error(`Error fetching cliente ${id}:`, error);
        return null;
    }
});

/**
 * Precargar un cliente específico
 */
export const preloadClienteById = (id: string) => {
    void getClienteById(id);
};
