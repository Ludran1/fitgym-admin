import { getClientes, preloadClientes } from "@/lib/data/clientes";
import { getMembresiasActivas } from "@/lib/data/membresias";
import { ClientesContent } from "./ClientesContent";

/**
 * Página de Gestión de Clientes - Server Component
 * Obtiene los datos directamente del servidor usando Prisma
 * y los pasa al componente cliente para interactividad
 */
export default async function ClientesPage() {
  // Precargar datos (opcional, para iniciar fetch temprano)
  preloadClientes();

  // Obtener clientes y membresías del servidor (cacheado por React)
  const [clientes, membresias] = await Promise.all([
    getClientes(),
    getMembresiasActivas()
  ]);

  return <ClientesContent initialClientes={clientes} membresiasDisponibles={membresias} />;
}
