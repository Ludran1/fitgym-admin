Acciones Recomendadas (prioridad alta a baja)

Migrar autenticación a Server Components: Usar cookies + @supabase/auth-helpers-nextjs (o implementas lectura de cookie JWT y validación servidor) para que layout.tsx sea server; pasar user como prop a componentes cliente que lo necesiten.
Convertir páginas de listado (clientes, membresías, aforo dashboard) a Server Components: Hacer fetch Prisma directamente en page.tsx; mantener componentes interactivos como cliente dentro.
Añadir loading.tsx en segmentos con data pesada (e.g. app/(protected)/clientes/loading.tsx) y usar <Suspense> para partes secundarias (estadísticas, paneles).
Implementar utilidades cacheadas: Crear src/lib/data/clientes.ts con import 'server-only' y export const getClientes = cache(async () => prisma.clientes.findMany(...)); añadir preloadClientes() y llamarlo arriba en el page.tsx.
Definir estrategia de revalidación: Para datos que cambian frecuentemente (aforo) marcar dinámicos (export const dynamic = 'force-dynamic' o noStore()); para catálogos más estáticos usar revalidate = 60.
Evaluar reemplazar algunas API handlers “read-only” por fetch directo en Server Component (menos capas). Mantener API para mutaciones externas o integraciones.
Introducir Server Actions donde tenga sentido (crear/actualizar membresías, clientes) para reducir round-trips y simplificar autorizaciones (token ya en request context).
Añadir server-only a todos módulos que no deben llegar al cliente (prisma.ts, helpers de datos, logger si adaptado).
Paralelizar fetch en dashboard server: Iniciar promesas (const clientesP = getClientes(); const aforoP = getAforo();) y await Promise.all.
Opcional: Activar experimental.taint para proteger objetos completos sensibles.
Añadir tests de regresión para nuevas server actions y RSC boundaries (si se incorpora).