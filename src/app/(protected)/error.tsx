"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Dumbbell } from "lucide-react";

export default function ProtectedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Error en segmento protegido:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-3xl font-bold">FitGym</h2>
          </div>
          <CardTitle className="text-2xl text-center flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-yellow-500" /> Error en área protegida</CardTitle>
          <CardDescription className="text-center">Ocurrió un problema al cargar esta página.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Puedes intentar recargar o volver al dashboard.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={() => reset()}>Reintentar</Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Ir al dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}