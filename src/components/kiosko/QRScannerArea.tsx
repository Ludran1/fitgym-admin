import { useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

interface QRScannerAreaProps {
    onScan: (codigo: string) => void;
}

export function QRScannerArea({ onScan }: QRScannerAreaProps) {
    const scannerAreaRef = useRef<HTMLDivElement | null>(null);

    const handleScan = (detectedCodes: any) => {
        let value = "";

        if (Array.isArray(detectedCodes)) {
            const rect = scannerAreaRef.current?.getBoundingClientRect();

            if (rect) {
                // Definir área de enfoque (centro 50% del área total)
                const padX = rect.width * 0.25;
                const padY = rect.height * 0.25;
                const left = rect.left + padX;
                const right = rect.right - padX;
                const top = rect.top + padY;
                const bottom = rect.bottom - padY;

                // Buscar código dentro del área de enfoque
                for (const code of detectedCodes) {
                    const box = code?.boundingBox;
                    let cx: number | undefined;
                    let cy: number | undefined;

                    // Calcular centro del código detectado
                    if (box && typeof box.x === "number") {
                        cx = box.x + box.width / 2;
                        cy = box.y + box.height / 2;
                    } else if (Array.isArray(code?.cornerPoints) && code.cornerPoints.length) {
                        const xs = code.cornerPoints.map((p: any) => p.x);
                        const ys = code.cornerPoints.map((p: any) => p.y);
                        cx = xs.reduce((a: number, b: number) => a + b, 0) / xs.length;
                        cy = ys.reduce((a: number, b: number) => a + b, 0) / ys.length;
                    }

                    // Verificar si está dentro del área de enfoque
                    if (cx !== undefined && cy !== undefined) {
                        if (cx >= left && cx <= right && cy >= top && cy <= bottom) {
                            value = code?.rawValue || "";
                            break;
                        }
                    }
                }
            }

            // Si no hay código en área de enfoque, usar el primero
            if (!value) {
                value = detectedCodes[0]?.rawValue || "";
            }
        }

        if (value) {
            onScan(value);
        }
    };

    return (
        <div ref={scannerAreaRef} className="relative rounded-lg overflow-hidden border border-neutral-800">
            <Scanner
                onScan={handleScan}
                onError={(error) => console.error(error)}
            />

            {/* Overlay de enfoque */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-md border-2 border-orange-500/80 shadow-[0_0_20px_rgba(234,88,12,0.3)] animate-pulse"></div>
            </div>
        </div>
    );
}
