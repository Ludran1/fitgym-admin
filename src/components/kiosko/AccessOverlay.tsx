import { CheckCircle2, User2, IdCard, Star, CalendarRange, XCircle, AlertTriangle } from "lucide-react";
import type { ClienteConMembresia, OverlayKind, DeniedReason } from "@/types/kiosko.types";

interface AccessOverlayProps {
    visible: boolean;
    kind: OverlayKind | null;
    deniedReason: DeniedReason | null;
    cliente: ClienteConMembresia | null;
    codigoQR: string;
    hora: string;
}

export function AccessOverlay({
    visible,
    kind,
    deniedReason,
    cliente,
    codigoQR,
    hora,
}: AccessOverlayProps) {
    if (!visible) return null;

    const formatoFecha = (iso?: string | null): string => {
        if (!iso) return "-";
        try {
            const d = new Date(iso);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
        } catch {
            return String(iso);
        }
    };

    // Overlay de acceso concedido
    if (kind === "granted" && cliente) {
        return (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950/70 backdrop-blur-sm">
                <div className="max-w-md w-[92%] rounded-2xl border border-green-700/40 bg-neutral-900/90 p-6 text-center animate-in fade-in duration-300">
                    <div className="flex flex-col items-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-green-600/10 border border-green-500/40 flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-8 w-8 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-400">¡Acceso Concedido!</div>
                        <div className="text-sm text-neutral-300">Bienvenido al gimnasio</div>
                    </div>

                    <div className="rounded-xl border border-green-700/30 bg-green-900/10 p-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-14 w-14 rounded-full bg-orange-600/20 border border-orange-500/40 flex items-center justify-center">
                                <User2 className="h-7 w-7 text-orange-400" />
                            </div>
                            <div className="text-xl font-bold text-white">{cliente.nombre}</div>
                            <div className="text-xs text-green-300">Miembro Verificado</div>
                        </div>

                        <div className="mt-4 space-y-3 text-left">
                            <div className="flex items-center gap-3 rounded-lg border border-green-800/40 bg-neutral-800/40 p-3">
                                <IdCard className="h-5 w-5 text-neutral-300" />
                                <div className="flex-1">
                                    <div className="text-xs text-neutral-400">ID de Miembro</div>
                                    <div className="text-sm font-medium">{codigoQR || cliente.dni || cliente.id}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-green-800/40 bg-neutral-800/40 p-3">
                                <Star className="h-5 w-5 text-neutral-300" />
                                <div className="flex-1">
                                    <div className="text-xs text-neutral-400">Tipo de Membresía</div>
                                    <div className="text-sm font-medium">
                                        {cliente.nombre_membresia || cliente.tipo_membresia || "-"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-green-800/40 bg-neutral-800/40 p-3">
                                <CalendarRange className="h-5 w-5 text-neutral-300" />
                                <div className="flex-1">
                                    <div className="text-xs text-neutral-400">Válida Hasta</div>
                                    <div className="text-sm font-medium">{formatoFecha(cliente.fecha_fin)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-xs text-green-300 mt-3">
                            ¡Que tengas un excelente entrenamiento!
                        </div>
                        <div className="text-center text-xs text-neutral-400">
                            {hora ? `Registrado a las ${hora}` : "Registro confirmado"}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Overlay de acceso denegado
    if (kind === "denied") {
        return (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950/70 backdrop-blur-sm">
                <div className="max-w-md w-[92%] rounded-2xl border border-red-700/40 bg-neutral-900/90 p-6 text-center animate-in fade-in duration-300">
                    <div className="flex flex-col items-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-red-600/10 border border-red-500/40 flex items-center justify-center mb-2">
                            <XCircle className="h-8 w-8 text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-red-400">Acceso Denegado</div>
                        <div className="text-sm text-neutral-300">
                            {deniedReason === "unknown" && "Usuario no registrado"}
                            {deniedReason === "expired" && "Membresía vencida"}
                            {deniedReason === "suspended" && "Membresía suspendida"}
                        </div>
                    </div>

                    {/* Usuario no registrado */}
                    {deniedReason === "unknown" ? (
                        <div className="rounded-xl border border-red-700/30 bg-red-900/10 p-4 text-left">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertTriangle className="h-5 w-5 text-red-300" />
                                <div className="text-base font-semibold">Desconocido</div>
                            </div>
                            <div className="text-sm text-neutral-200 font-semibold mb-2">
                                Para acceder al gimnasio:
                            </div>
                            <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
                                <li>Dirígete a recepción para registrarte</li>
                                <li>Verifica que tu código QR sea correcto</li>
                            </ul>
                            <div className="text-center text-[11px] text-neutral-400 mt-3">
                                Redirigiendo en 5 segundos...
                            </div>
                        </div>
                    ) : (
                        /* Cliente con membresía vencida o suspendida */
                        <div className="rounded-xl border border-red-700/30 bg-red-900/10 p-4 text-left">
                            {cliente && (
                                <>
                                    <div className="flex flex-col items-center gap-2 mb-3">
                                        <div className="h-14 w-14 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                                            <AlertTriangle className="h-7 w-7 text-red-300" />
                                        </div>
                                        <div className="text-xl font-bold text-white">{cliente.nombre}</div>
                                        <div className="text-xs text-red-300">
                                            {deniedReason === "expired" ? "Membresía Expirada" : "Membresía Suspendida"}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 rounded-lg border border-red-800/40 bg-neutral-800/40 p-3">
                                            <IdCard className="h-5 w-5 text-neutral-300" />
                                            <div className="flex-1">
                                                <div className="text-xs text-neutral-400">ID de Miembro</div>
                                                <div className="text-sm font-medium">
                                                    {codigoQR || cliente.dni || cliente.id}
                                                </div>
                                            </div>
                                        </div>

                                        {deniedReason === "expired" && (
                                            <div className="flex items-center gap-3 rounded-lg border border-red-800/40 bg-neutral-800/40 p-3">
                                                <CalendarRange className="h-5 w-5 text-neutral-300" />
                                                <div className="flex-1">
                                                    <div className="text-xs text-neutral-400">Fecha de Vencimiento</div>
                                                    <div className="text-sm font-medium">{formatoFecha(cliente.fecha_fin)}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="mt-4 text-sm text-neutral-200 font-semibold">
                                Para acceder al gimnasio:
                            </div>
                            <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
                                {deniedReason === "expired" ? (
                                    <>
                                        <li>Renueva tu membresía en recepción</li>
                                        <li>O contáctanos para opciones de renovación</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Consulta en recepción para habilitar tu membresía</li>
                                        <li>Verifica tu estado con el personal</li>
                                    </>
                                )}
                            </ul>
                            <div className="text-center text-[11px] text-neutral-400 mt-3">
                                Redirigiendo en 5 segundos...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
