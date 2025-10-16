"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    true // desarrollo: acceso directo; luego se valida desde localStorage
  );

  const login = () => {
    try {
      localStorage.setItem("fitgym-auth", "true");
    } catch {}
    setIsAuthenticated(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem("fitgym-auth");
    } catch {}
    setIsAuthenticated(false);
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("fitgym-auth");
      setIsAuthenticated(token === "true");
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}