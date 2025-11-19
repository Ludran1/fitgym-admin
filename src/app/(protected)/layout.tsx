import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import { GymLayout } from "@/components/GymLayout";

/**
 * Layout protegido - Server Component
 * Verifica autenticación en el servidor antes de renderizar
 * No hay "flash" ni loading states innecesarios
 */
export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  // Obtener usuario del servidor
  const user = await getUser();

  // Si no hay usuario, redirigir a login (server-side)
  if (!user) {
    redirect("/login");
  }

  // Verificar que sea admin
  const role = user.user_metadata?.rol || user.app_metadata?.rol;
  if (role !== 'admin') {
    redirect("/login");
  }

  // Usuario autenticado y autorizado, renderizar layout
  return <GymLayout user={user}>{children}</GymLayout>;
}