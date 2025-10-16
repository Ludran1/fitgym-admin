"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status =
  | { ok: true; message: string }
  | { ok: false; message: string; details?: string };

export default function ClientSupabaseCheck() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
          setStatus({ ok: false, message: "Variables de entorno faltantes", details: "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY" });
          return;
        }

        const { data, error } = await supabase
          .from("clientes")
          .select("id")
          .limit(1);

        if (error) {
          setStatus({ ok: false, message: "Error conectando a la base de datos", details: error.message });
          return;
        }

        setStatus({ ok: true, message: `Conexión exitosa. ${data?.length ? "Datos disponibles" : "Sin registros"}` });
      } catch (e: any) {
        setStatus({ ok: false, message: "Error inesperado", details: e?.message });
      }
    }
    check();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Verificación de Supabase (Cliente)</h1>
      {status === null ? (
        <p className="text-muted-foreground">Comprobando conexión...</p>
      ) : status.ok ? (
        <div className="rounded border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-green-700">{status.message}</p>
        </div>
      ) : (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-700">{status.message}</p>
          {status.details && (
            <p className="mt-2 text-sm text-red-600">{status.details}</p>
          )}
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        Asegúrate de configurar <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
      </div>
    </div>
  );
}