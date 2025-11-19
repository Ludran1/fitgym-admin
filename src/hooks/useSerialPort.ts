import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { SerialPortState } from "@/types/kiosko.types";

export function useSerialPort() {
    const { toast } = useToast();
    const [estado, setEstado] = useState<SerialPortState>("desconectada");
    const [disponible, setDisponible] = useState(false);

    const serialPortRef = useRef<any>(null);
    const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
    const encoderRef = useRef(new TextEncoder());

    useEffect(() => {
        // Verificar disponibilidad de Serial API solo en cliente
        setDisponible(typeof (navigator as any).serial !== "undefined");

        // Cleanup al desmontar
        return () => {
            try {
                writerRef.current?.releaseLock();
                serialPortRef.current?.close?.();
            } catch (error) {
                // Silenciar errores de cleanup
            }
        };
    }, []);

    const conectar = async () => {
        if (!disponible) {
            toast({
                variant: "destructive",
                title: "Serial no disponible",
                description: "Usa Chrome o Edge para acceder al puerto serial",
            });
            return;
        }

        try {
            const port = await (navigator as any).serial.requestPort({ filters: [] });
            await port.open({ baudRate: 9600 });

            serialPortRef.current = port;
            const writer = port.writable?.getWriter();
            writerRef.current = writer || null;

            setEstado("conectada");
            toast({
                title: "Puerta conectada",
                description: "Lista para abrir",
            });
        } catch (error: any) {
            setEstado("error");
            toast({
                variant: "destructive",
                title: "Error al conectar",
                description: error?.message || "No se pudo conectar al puerto serial",
            });
        }
    };

    const abrir = async (duracionMs: number = 2000) => {
        if (!writerRef.current) {
            return;
        }

        try {
            setEstado("abriendo");

            // Enviar comando de apertura
            await writerRef.current.write(encoderRef.current.encode("O"));

            // Después del tiempo especificado, enviar comando de cierre
            setTimeout(async () => {
                try {
                    if (writerRef.current) {
                        await writerRef.current.write(encoderRef.current.encode("C"));
                    }
                    setEstado("conectada");
                } catch (error) {
                    setEstado("error");
                }
            }, duracionMs);
        } catch (error) {
            setEstado("error");
        }
    };

    return {
        estado,
        disponible,
        conectar,
        abrir,
    };
}
