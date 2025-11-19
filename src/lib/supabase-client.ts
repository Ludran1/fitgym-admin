import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * Crea un cliente Supabase para Client Components
 * Maneja cookies automáticamente en el navegador
 * No necesita configuración de storage - usa cookies nativas
 */
export function createClientSupabaseClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Singleton para reutilizar en client components
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Obtiene o crea el cliente Supabase del navegador (singleton)
 * Usar en Client Components únicamente
 */
export function getSupabaseBrowserClient() {
    if (!browserClient) {
        browserClient = createClientSupabaseClient();
    }
    return browserClient;
}
