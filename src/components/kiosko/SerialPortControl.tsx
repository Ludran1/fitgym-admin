import { Button } from "@/components/ui/button";
import type { SerialPortState } from "@/types/kiosko.types";

interface SerialPortControlProps {
    disponible: boolean;
    estado: SerialPortState;
    onConectar: () => void;
}

export function SerialPortControl({ disponible, estado, onConectar }: SerialPortControlProps) {
    if (!disponible) {
        return (
            <div className="flex items-center justify-between">
                <div className="text-xs text-neutral-300">Puerta: no soportado</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-300">Puerta: {estado}</div>
            {estado === "desconectada" && (
                <Button
                    onClick={onConectar}
                    variant="outline"
                    size="sm"
                    className="px-3 py-1 text-sm rounded-md border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
                >
                    Conectar puerta
                </Button>
            )}
        </div>
    );
}
