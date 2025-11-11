import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook para verificar si ya existe una sesión activa al cargar la página
 * Redirige automáticamente si el usuario ya está autenticado como admin
 */
export function useSessionCheck() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Solo redirigir si ya terminó de cargar y está autenticado
        if (!isLoading && isAuthenticated) {
            router.replace("/");
        }
    }, [isAuthenticated, isLoading, router]);
}
