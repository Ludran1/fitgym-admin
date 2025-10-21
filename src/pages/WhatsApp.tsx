
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function WhatsApp() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp deshabilitado temporalmente</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Las funcionalidades de WhatsApp se han ocultado temporalmente mientras migramos completamente los datos a Prisma. Volverán a estar disponibles más adelante.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
