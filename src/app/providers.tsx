"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    // Obtener sesión inicial
    (async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session ?? null);
      } catch (e) {
        console.warn("Fallo obteniendo la sesión de Supabase", e);
        setSession(null);
      } finally {
        setLoading(false);
      }
    })();

    // Suscribirse a cambios de auth
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      try {
        subscription?.subscription?.unsubscribe();
      } catch (e) {
        console.warn("Error anulando la suscripción de cambios de auth", e);
      }
    };
  }, [setSession, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
      {/* React Query Devtools - solo visible en desarrollo */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
