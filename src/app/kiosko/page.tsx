"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QRScannerArea } from "@/components/kiosko/QRScannerArea";
import { AccessOverlay } from "@/components/kiosko/AccessOverlay";
import { SerialPortControl } from "@/components/kiosko/SerialPortControl";
import { useSerialPort } from "@/hooks/useSerialPort";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useQRScanner } from "@/hooks/useQRScanner";
import { useAttendanceRegistration } from "@/hooks/useAttendanceRegistration";
import type { OverlayState, ClienteConMembresia } from "@/types/kiosko.types";

export default function KioskoPage() {
  const [horaActual, setHoraActual] = useState<string>("");
  const [overlayState, setOverlayState] = useState<OverlayState>({
    visible: false,
    kind: null,
    deniedReason: null,
    cliente: null,
    codigoQR: "",
    hora: "",
  });

  // Hooks personalizados
  const serialPort = useSerialPort();
  const accessControl = useAccessControl();
  const qrScanner = useQRScanner();
  const attendance = useAttendanceRegistration();

  // Actualizar hora cada segundo
  useEffect(() => {
    setHoraActual(new Date().toLocaleTimeString());

    const intervalId = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Ocultar overlay después de 5 segundos
  useEffect(() => {
    if (!overlayState.visible) return;

    const timeoutId = setTimeout(() => {
      setOverlayState({
        visible: false,
        kind: null,
        deniedReason: null,
        cliente: null,
        codigoQR: "",
        hora: "",
      });
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [overlayState.visible]);

  const handleAccessGranted = async (cliente: ClienteConMembresia, codigoQR: string) => {
    // Reproducir sonido de acceso
    await attendance.playAccessSound();
    
    // Abrir cerradura si está conectada
    await serialPort.abrir();

    // Mostrar overlay de acceso concedido
    setOverlayState({
      visible: true,
      kind: "granted",
      deniedReason: null,
      cliente,
      codigoQR,
      hora: new Date().toTimeString().split(" ")[0],
    });
  };

  const handleAccessDenied = (
    cliente: ClienteConMembresia | null,
    codigoQR: string,
    reason: "unknown" | "expired" | "suspended"
  ) => {
    setOverlayState({
      visible: true,
      kind: "denied",
      deniedReason: reason,
      cliente,
      codigoQR,
      hora: "",
    });
  };

  const handleScan = async (codigo: string) => {
    // Buscar cliente por código
    const cliente = await qrScanner.procesarCodigo(codigo);

    if (!cliente) {
      // Cliente no encontrado
      handleAccessDenied(null, codigo, "unknown");
      return;
    }

    // Validar acceso del cliente
    const validation = accessControl.validarAcceso(cliente);

    if (!validation.allowed) {
      // Acceso denegado
      handleAccessDenied(cliente, codigo, validation.reason!);
      return;
    }

    // Registrar asistencia
    const result = await attendance.registrarAsistencia(cliente, validation.isDailyPass);

    if (result.success) {
      // Acceso concedido
      handleAccessGranted(cliente, codigo);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col items-center p-6">
      {/* Hora en la esquina superior derecha */}
      <div className="fixed top-4 right-6 z-30">
        <span className="px-4 py-2 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-100 font-mono text-3xl tracking-tight shadow-sm">
          {horaActual || "--:--:--"}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="h-12 w-12 rounded-full bg-orange-500/10 border border-orange-500/40 flex items-center justify-center mb-2">
          <Camera className="h-6 w-6 text-orange-400" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-wide">CONTROL DE ASISTENCIA</h1>
        <p className="text-sm text-muted-foreground">Escanea tu código QR para acceder</p>
      </div>

      {/* Card principal */}
      <Card className="bg-neutral-900 border-neutral-800 w-full max-w-2xl">
        <CardContent className="pt-6 space-y-4">
          {/* Control del puerto serial */}
          <SerialPortControl
            disponible={serialPort.disponible}
            estado={serialPort.estado}
            onConectar={serialPort.conectar}
          />

          {/* Área del scanner con overlay */}
          <div className="relative">
            <QRScannerArea onScan={handleScan} />
            
            {/* Overlay de acceso concedido/denegado */}
            <AccessOverlay
              visible={overlayState.visible}
              kind={overlayState.kind}
              deniedReason={overlayState.deniedReason}
              cliente={overlayState.cliente}
              codigoQR={overlayState.codigoQR}
              hora={overlayState.hora}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
