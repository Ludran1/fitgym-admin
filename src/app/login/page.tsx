import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkAdminExists } from "@/app/actions/auth";
import { getUser } from "@/lib/supabase-server";
import { AUTH_MESSAGES } from "@/lib/auth-utils";
import Logo from "@/components/Logo";
import { LoginFormClient, RegisterFormClient } from "@/components/auth";

export default async function LoginPage() {
  // Si ya está autenticado, redirigir al dashboard
  const user = await getUser();
  if (user) {
    redirect('/');
  }

  // Verificar si existe un administrador
  const existeAdmin = await checkAdminExists();

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo />
          <CardTitle className="text-2xl text-center">
            {existeAdmin
              ? AUTH_MESSAGES.VERIFICATION.LOGIN_TITLE
              : AUTH_MESSAGES.VERIFICATION.REGISTER_TITLE}
          </CardTitle>
          <CardDescription className="text-center">
            {existeAdmin
              ? AUTH_MESSAGES.VERIFICATION.LOGIN_DESCRIPTION
              : AUTH_MESSAGES.VERIFICATION.REGISTER_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existeAdmin ? (
            <LoginFormClient />
          ) : (
            <RegisterFormClient />
          )}
        </CardContent>
      </Card>
    </div>
  );
}