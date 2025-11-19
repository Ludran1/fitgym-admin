import { useCallback } from "react";
import type { ClienteConMembresia, AccessValidationResult, DeniedReason } from "@/types/kiosko.types";

export function useAccessControl() {
    // Determina si la membresía está vencida por fecha_fin
    const estaVencidaPorFecha = useCallback((fechaFin?: string | null): boolean => {
        if (!fechaFin) return false;

        const ahora = new Date();
        const finDate = new Date(fechaFin);
        // Considera vigente hasta el final del día local de fecha_fin
        finDate.setHours(23, 59, 59, 999);

        return ahora.getTime() > finDate.getTime();
    }, []);

    // Valida si el cliente tiene acceso permitido
    const validarAcceso = useCallback(
        (cliente: ClienteConMembresia): AccessValidationResult => {
            const vencidaPorFecha = estaVencidaPorFecha(cliente.fecha_fin);
            const suspendida = cliente.estado === "suspendida";
            const vencidaEstado = cliente.estado === "vencida";

            // Verificar si es pase diario
            let esDiario = false;
            if (cliente.membresias) {
                const membresia = Array.isArray(cliente.membresias)
                    ? cliente.membresias[0]
                    : cliente.membresias;
                esDiario = membresia?.modalidad === "diario";
            }

            // Determinar razón de denegación
            let reason: DeniedReason | undefined;
            if (vencidaPorFecha || vencidaEstado) {
                reason = "expired";
            } else if (suspendida) {
                reason = "suspended";
            }

            const allowed = !vencidaPorFecha && !suspendida && !vencidaEstado;

            return {
                allowed,
                reason,
                isDailyPass: esDiario,
            };
        },
        [estaVencidaPorFecha]
    );

    return {
        validarAcceso,
        estaVencidaPorFecha,
    };
}
