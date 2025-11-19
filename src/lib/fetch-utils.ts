import { supabase } from './supabase';

/**
 * Wrapper de fetch que incluye automáticamente el token de autenticación
 * en los headers para peticiones API protegidas
 * 
 * NOTA: Solo usar en Client Components para MUTACIONES (POST, PUT, DELETE)
 * Para cargar datos iniciales, usar Server Components con data layer (src/lib/data/*)
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Intentar obtener el token actual de la sesión
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
        console.warn('No hay sesión activa en cliente, usando fetch sin auth header');
        // En lugar de lanzar error, hacer fetch sin auth y dejar que el API route valide
        return fetch(url, options);
    }

    // Agregar el token al header Authorization
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);
    
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * Helper para hacer peticiones GET autenticadas con manejo de errores
 */
export async function authenticatedGet<T>(url: string): Promise<T> {
    const response = await authenticatedFetch(url, { method: 'GET' });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * Helper para hacer peticiones POST autenticadas con manejo de errores
 */
export async function authenticatedPost<T>(url: string, data: any): Promise<T> {
    const response = await authenticatedFetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
}
