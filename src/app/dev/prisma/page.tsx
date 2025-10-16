export const dynamic = 'force-dynamic'

type Cliente = {
  id: string
  nombre: string
  email: string
  telefono: string
  estado: string
  created_at: string
  membresia?: { id: string; nombre: string } | null
}

export default async function Page() {
  let clientes: Cliente[] = []
  let error: string | null = null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/clientes`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      error = `Error ${res.status}`
    } else {
      clientes = await res.json()
    }
  } catch (e) {
    error = 'No se pudo conectar al API. Revisa DATABASE_URL.'
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Prisma Test: Clientes</h1>
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Teléfono</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2 pr-4">Membresía</th>
              <th className="py-2 pr-4">Creado</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2 pr-4">{c.nombre}</td>
                <td className="py-2 pr-4">{c.email}</td>
                <td className="py-2 pr-4">{c.telefono}</td>
                <td className="py-2 pr-4">{c.estado}</td>
                <td className="py-2 pr-4">{c.membresia?.nombre ?? '-'}</td>
                <td className="py-2 pr-4">{new Date(c.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!error && clientes.length === 0 && (
        <p className="text-muted-foreground">Sin clientes o base vacía.</p>
      )}
    </main>
  )
}