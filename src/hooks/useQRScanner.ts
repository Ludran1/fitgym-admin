import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { ClienteConMembresia } from "@/types/kiosko.types";

export function useQRScanner() {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const lastCodeRef = useRef<string>("");
    const lastTimeRef = useRef<number>(0);

    const buscarClientePorCodigo = useCallback(
        async (codigo: string): Promise<ClienteConMembresia | null> => {
            // Buscar por código CLIENT:id
            if (codigo.startsWith("CLIENT:")) {
                const id = codigo.slice(7);
                const response = await fetch(`/api/clientes/${id}`);

                if (response.ok) {
                    return await response.json();
                }
            }

            // Buscar por código de tarjeta de acceso
            const { data: tarjeta } = await supabase
                .from("tarjetas_acceso")
                .select(`
          codigo,
          clientes (
            id, 
            nombre, 
            dni, 
            estado, 
            avatar_url, 
            fecha_fin, 
            membresia_id,
            membresias (
              nombre,
              modalidad
            )
          )
        `)
                .eq("codigo", codigo)
                .maybeSingle();

            if (tarjeta?.clientes) {
                const clienteData = Array.isArray(tarjeta.clientes)
                    ? tarjeta.clientes[0]
                    : tarjeta.clientes;

                // Enriquecer con información de membresía
                if (clienteData) {
                    let nombreMembresia: string | null = null;
                    let modalidadMembresia: string | null = null;

                    if (clienteData.membresias) {
                        const membresia = Array.isArray(clienteData.membresias)
                            ? clienteData.membresias[0]
                            : clienteData.membresias;

                        if (membresia) {
                            nombreMembresia = membresia.nombre;
                            modalidadMembresia = membresia.modalidad;
                        }
                    }

                    return {
                        ...(clienteData as any),
                        nombre_membresia: nombreMembresia,
                        tipo_membresia: modalidadMembresia,
                    };
                }
            }

            return null;
        },
        []
    );

    const procesarCodigo = useCallback(
        async (codigo: string): Promise<ClienteConMembresia | null> => {
            if (!codigo) {
                toast({
                    variant: "destructive",
                    title: "Código inválido",
                    description: "Intenta nuevamente.",
                });
                return null;
            }

            // Anti-doble lectura en ráfaga (5 segundos)
            const now = Date.now();
            if (lastCodeRef.current === codigo && now - lastTimeRef.current < 5000) {
                return null; // Ignora duplicado
            }

            lastCodeRef.current = codigo;
            lastTimeRef.current = now;
            setIsProcessing(true);

            try {
                const cliente = await buscarClientePorCodigo(codigo);

                if (!cliente) {
                    toast({
                        variant: "destructive",
                        title: "Cliente no encontrado",
                        description: "El código no coincide con ningún cliente registrado.",
                    });
                    return null;
                }

                return cliente;
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error al buscar cliente",
                    description: error.message || "Ocurrió un error inesperado.",
                });
                return null;
            } finally {
                setIsProcessing(false);
            }
        },
        [buscarClientePorCodigo, toast]
    );

    return {
        procesarCodigo,
        isProcessing,
    };
}
