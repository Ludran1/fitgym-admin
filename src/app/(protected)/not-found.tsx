import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

export default function ProtectedNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-3xl font-bold">FitGym</h2>
          </div>
          <CardTitle className="text-2xl text-center">No encontrado (Área protegida)</CardTitle>
          <CardDescription className="text-center">
            El recurso que buscas dentro del área protegida no existe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Revisa el enlace o vuelve al panel principal.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/">Ir al dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Ir al login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}