import { getClientes, preloadClientes } from "@/lib/data/clientes";
import { ClientesContent } from "./ClientesContent";

/**
 * Página de Gestión de Clientes - Server Component
 * Obtiene los datos directamente del servidor usando Prisma
 * y los pasa al componente cliente para interactividad
 */
export default async function ClientesPage() {
  // Precargar datos (opcional, para iniciar fetch temprano)
  preloadClientes();

  // Obtener clientes del servidor (cacheado por React)
  const clientes = await getClientes();

  return <ClientesContent initialClientes={clientes} />;
}
