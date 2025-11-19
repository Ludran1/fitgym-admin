import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/**
 * Crea un cliente Supabase para Server Components/Server Actions/Route Handlers
 * Lee y escribe cookies automáticamente
 */
export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // El método `setAll` fue llamado desde un Server Component
                        // Esto puede ser ignorado si tienes middleware refrescando cookies
                    }
                },
            },
        }
    );
}

/**
 * Obtiene la sesión actual del servidor
 * Retorna null si no hay sesión activa
 */
export async function getSession() {
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session:', error);
        return null;
    }

    return session;
}

/**
 * Obtiene el usuario actual del servidor
 * Retorna null si no está autenticado
 */
export async function getUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error('Error getting user:', error);
        return null;
    }

    return user;
}

/**
 * Verifica si el usuario actual es administrador
 */
export async function isAdmin() {
    const user = await getUser();
    if (!user) return false;

    const role = user.user_metadata?.rol || user.app_metadata?.rol;
    return role === 'admin';
}

/**
 * Obtiene el rol del usuario actual
 */
export async function getUserRole() {
    const user = await getUser();
    if (!user) return null;

    return user.user_metadata?.rol || user.app_metadata?.rol || null;
}
