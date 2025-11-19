import { useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ClienteConMembresia } from "@/types/kiosko.types";

export function useAttendanceRegistration() {
    const { toast } = useToast();
    const audioCtxRef = useRef<AudioContext | null>(null);

    const playAccessSound = useCallback(async () => {
        try {
            if (!audioCtxRef.current) {
                const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
                audioCtxRef.current = AC ? new AC() : null;
            }

            const ctx = audioCtxRef.current;
            if (!ctx) return;

            if (ctx.state === "suspended") {
                try {
                    await ctx.resume();
                } catch {
                    // Silenciar error
                }
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.26);
        } catch {
            // Silenciar errores de audio
        }
    }, []);

    const registrarAsistencia = useCallback(
        async (cliente: ClienteConMembresia, isDailyPass: boolean = false) => {
            try {
                const response = await fetch("/api/asistencias", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cliente_id: cliente.id,
                        notas: "qr",
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    // Si ya registró hoy pero es pase diario, permitir acceso
                    if (data.error?.includes("ya registró su asistencia hoy") && isDailyPass) {
                        const hora = new Date().toTimeString().split(" ")[0];
                        return {
                            success: true,
                            hora,
                            message: "Acceso concedido (ya registrado hoy)",
                        };
                    }

                    throw new Error(data.error || "Error al registrar asistencia");
                }

                const hora = new Date(data.fecha_asistencia).toTimeString().split(" ")[0];

                return {
                    success: true,
                    hora,
                    message: "Asistencia registrada exitosamente",
                };
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error al registrar",
                    description: error.message,
                });

                return {
                    success: false,
                    hora: "",
                    message: error.message,
                };
            }
        },
        [toast]
    );

    return {
        registrarAsistencia,
        playAccessSound,
    };
}
