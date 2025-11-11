"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    QrCode,
    UserCheck,
    Camera,
    CameraOff,
    Maximize2,
    Minimize2,
} from "lucide-react";
import { Cliente } from "@/queries/clientesQueries";
import { useRegistrarAsistencia } from "@/queries/asistenciasQueries";

export function RegistroAsistenciaCard() {
    const [dniInput, setDniInput] = useState("");
    const [modoAsistencia, setModoAsistencia] = useState<"qr" | "dni">("dni");
    const [qrManual, setQrManual] = useState("");
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isProcessingQR, setIsProcessingQR] = useState(false);
    const [lastScannedQR, setLastScannedQR] = useState("");
    const [lastRegisteredClient, setLastRegisteredClient] = useState<string | null>(null);
    const { toast } = useToast();

    const { mutate: registrarAsistenciaAPI, isPending: isLoading } = useRegistrarAsistencia();

    // Escáner QR (carga dinámica en cliente)
    const QrScanner = dynamic(
        () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
        { ssr: false }
    );

    const registrarAsistencia = useCallback(
        async (cliente: Cliente, tipo: "qr" | "dni") => {
            if (cliente.estado === "vencida" || cliente.estado === "suspendida") {
                toast({
                    variant: "destructive",
                    title: "Error de registro",
                    description: "La membresía de este cliente no está activa.",
                });
                return;
            }

            // Usar la mutación de TanStack Query
            registrarAsistenciaAPI(
                {
                    cliente_id: cliente.id,
                    notas: tipo,
                },
                {
                    onSuccess: (asistencia) => {
                        const hora = new Date(asistencia.fecha_asistencia)
                            .toTimeString()
                            .split(" ")[0];

                        // Actualizar el mensaje de confirmación para el QR scanner
                        if (tipo === "qr") {
                            setLastRegisteredClient(`${cliente.nombre} - ${hora}`);
                            // Limpiar el mensaje después de 5 segundos
                            setTimeout(() => {
                                setLastRegisteredClient(null);
                            }, 5000);
                        }

                        setDniInput("");
                    },
                    onError: (error: Error) => {
                        // Para el QR scanner, limpiar el estado si hay error de asistencia duplicada
                        if (
                            tipo === "qr" &&
                            error.message.includes("ya registró su asistencia hoy")
                        ) {
                            setLastRegisteredClient(`${cliente.nombre} - Ya registrado hoy`);
                            setTimeout(() => {
                                setLastRegisteredClient(null);
                            }, 5000);
                        }
                    },
                }
            );
        },
        [registrarAsistenciaAPI, toast]
    );

    const registrarPorDNI = useCallback(async () => {
        if (!dniInput) {
            toast({
                variant: "destructive",
                title: "Error de registro",
                description: "Por favor, ingresa un DNI válido.",
            });
            return;
        }

        try {
            // Buscar cliente por DNI en la API
            const response = await fetch(`/api/clientes/validar-dni?dni=${dniInput}`);

            if (!response.ok) {
                toast({
                    variant: "destructive",
                    title: "Cliente no encontrado",
                    description: "No existe un cliente con el DNI ingresado.",
                });
                return;
            }

            const data = await response.json();

            if (!data.existe || !data.cliente) {
                toast({
                    variant: "destructive",
                    title: "Cliente no encontrado",
                    description: "No existe un cliente con el DNI ingresado.",
                });
                return;
            }

            await registrarAsistencia(data.cliente, "dni");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error buscando cliente",
                description: error.message,
            });
        }
    }, [dniInput, toast, registrarAsistencia]);

    const registrarPorQRTexto = useCallback(
        async (texto: string, fromCamera: boolean = false) => {
            const contenido = texto.trim();

            // Si viene de la cámara, verificar si ya se está procesando o es el mismo QR
            if (fromCamera) {
                if (isProcessingQR) {
                    return; // Ya se está procesando un QR
                }
                if (lastScannedQR === contenido) {
                    return; // Es el mismo QR que se acaba de escanear
                }
            }

            if (!contenido) {
                toast({
                    variant: "destructive",
                    title: "QR vacío",
                    description: "El contenido del QR no es válido.",
                });
                return;
            }

            let cliente: Cliente | null = null;

            try {
                if (fromCamera) {
                    setIsProcessingQR(true);
                    setLastScannedQR(contenido);
                }

                if (contenido.startsWith("CLIENT:")) {
                    const id = contenido.slice("CLIENT:".length);
                    const response = await fetch(`/api/clientes/${id}`);

                    if (response.ok) {
                        cliente = await response.json();
                    }
                } else {
                    // Intentar buscar por DNI
                    const response = await fetch(
                        `/api/clientes/validar-dni?dni=${contenido}`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        cliente = data.existe ? data.cliente : null;
                    }
                }

                if (!cliente) {
                    toast({
                        variant: "destructive",
                        title: "Cliente no encontrado",
                        description: "El QR no coincide con ningún cliente.",
                    });
                    if (fromCamera) {
                        // Resetear después de 2 segundos para permitir intentar con otro QR
                        setTimeout(() => {
                            setLastScannedQR("");
                            setIsProcessingQR(false);
                        }, 2000);
                    }
                    return;
                }

                await registrarAsistencia(cliente, "qr");

                if (fromCamera) {
                    // Resetear después de 3 segundos para permitir escanear otro QR
                    setTimeout(() => {
                        setLastScannedQR("");
                        setIsProcessingQR(false);
                    }, 3000);
                }
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error buscando cliente",
                    description: error.message,
                });
                if (fromCamera) {
                    setTimeout(() => {
                        setLastScannedQR("");
                        setIsProcessingQR(false);
                    }, 2000);
                }
            }
        },
        [isProcessingQR, lastScannedQR, registrarAsistencia, toast]
    );

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Registro de Asistencia</CardTitle>
                        <CardDescription>
                            Selecciona el método de verificación
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                        title={
                            isFullscreen
                                ? "Salir de pantalla completa"
                                : "Pantalla completa"
                        }
                    >
                        {isFullscreen ? (
                            <Minimize2 className="h-5 w-5" />
                        ) : (
                            <Maximize2 className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className={isFullscreen ? "flex justify-center" : ""}>
                <div
                    className={`space-y-4 ${isFullscreen ? "w-full max-w-2xl" : ""}`}
                >
                    <div className="flex space-x-2">
                        <Button
                            variant={modoAsistencia === "dni" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setModoAsistencia("dni")}
                        >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Por DNI
                        </Button>
                        <Button
                            variant={modoAsistencia === "qr" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setModoAsistencia("qr")}
                        >
                            <QrCode className="mr-2 h-4 w-4" />
                            Por QR
                        </Button>
                    </div>

                    {modoAsistencia === "dni" ? (
                        <div className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Ingresa el número de DNI"
                                    value={dniInput}
                                    onChange={(e) => setDniInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            registrarPorDNI();
                                        }
                                    }}
                                    className={isFullscreen ? "text-lg py-4" : ""}
                                />
                                <Button
                                    onClick={registrarPorDNI}
                                    disabled={isLoading}
                                    className={isFullscreen ? "px-6" : ""}
                                >
                                    Verificar
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Ingresa el DNI del cliente y presiona Verificar para registrar
                                su asistencia.
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    variant={cameraEnabled ? "default" : "outline"}
                                    className="flex-1"
                                    onClick={() => setCameraEnabled((v) => !v)}
                                >
                                    {cameraEnabled ? (
                                        <>
                                            <CameraOff className="mr-2 h-4 w-4" />
                                            Desactivar cámara
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="mr-2 h-4 w-4" />
                                            Activar cámara
                                        </>
                                    )}
                                </Button>
                            </div>
                            {cameraEnabled && (
                                <>
                                    <div className="rounded-md border overflow-hidden relative">
                                        <QrScanner
                                            constraints={{ facingMode: "environment" }}
                                            scanDelay={500}
                                            onScan={(detected) => {
                                                const text = detected?.[0]?.rawValue || "";
                                                if (text && !isProcessingQR) {
                                                    registrarPorQRTexto(text, true);
                                                }
                                            }}
                                            onError={() => {
                                                /* Silencio errores menores de cámara */
                                            }}
                                            styles={{
                                                container: {
                                                    width: "100%",
                                                    aspectRatio: isFullscreen ? "16/9" : "16/9",
                                                },
                                            }}
                                        />
                                        {isProcessingQR && (
                                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow-lg">
                                                    <p className="text-sm font-medium">Procesando...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {lastRegisteredClient && (
                                        <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-md p-3">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                <div>
                                                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                                                        ✓ Asistencia registrada
                                                    </p>
                                                    <p className="text-xs text-green-700 dark:text-green-300">
                                                        {lastRegisteredClient}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {!cameraEnabled && (
                                <>
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="Pega el contenido del QR o DNI"
                                            value={qrManual}
                                            onChange={(e) => setQrManual(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    registrarPorQRTexto(qrManual);
                                                }
                                            }}
                                            className={isFullscreen ? "text-lg py-4" : ""}
                                        />
                                        <Button
                                            onClick={() => registrarPorQRTexto(qrManual)}
                                            disabled={isLoading}
                                            className={isFullscreen ? "px-6" : ""}
                                        >
                                            Verificar
                                        </Button>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Escanea el código QR del cliente con la cámara o pega su
                                        contenido manualmente.
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
