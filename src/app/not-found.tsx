import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import Logo from "@/components/Logo";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="flex items-center justify-center mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl text-center">404 — Página no encontrada</CardTitle>
                    <CardDescription className="text-center">
                        La ruta que intentas visitar no existe o fue movida.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                        Verifica el enlace o vuelve al inicio para continuar.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button asChild className="w-full">
                        <Link href="/">Volver al inicio</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/login">Ir al login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}