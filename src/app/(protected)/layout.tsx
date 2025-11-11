"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { GymLayout } from "@/components/GymLayout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si ya terminó de cargar y no está autenticado
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Mientras carga, mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no está autenticado (y ya terminó de cargar), no mostrar nada
  if (!isAuthenticated) return null;

  return <GymLayout>{children}</GymLayout>;
}