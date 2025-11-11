"use client";

import { RegistroAsistenciaCard } from "@/components/asistencia/RegistroAsistenciaCard";
import { ListaAsistencias } from "@/components/asistencia/ListaAsistencias";
import { useAsistenciasQuery } from "@/queries/asistenciasQueries";

export default function AsistenciaPage() {
  // Usar TanStack Query para obtener las asistencias
  const { data: asistencias = [], isLoading } = useAsistenciasQuery({ limit: 100 });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Registro de Asistencia</h1>
        <p className="text-muted-foreground">
          Registra la asistencia de los miembros del gimnasio
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Componente de registro autocontenido - no necesita props */}
        <RegistroAsistenciaCard />

        {/* Lista de asistencias con loading state */}
        <ListaAsistencias asistencias={asistencias} isLoading={isLoading} />
      </div>
    </div>
  );
}
