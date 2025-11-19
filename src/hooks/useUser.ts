'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

/**
 * Hook simple para obtener el usuario actual en Client Components
 * No usa Zustand ni localStorage - solo el cliente nativo de Supabase
 * 
 * IMPORTANTE: Para Server Components, usar getUser() de @/lib/supabase-server
 */
export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        // Obtener usuario inicial
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setLoading(false);
        });

        // Suscribirse a cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    return { user, loading };
}

/**
 * Hook que retorna si el usuario es admin
 */
export function useIsAdmin() {
    const { user, loading } = useUser();

    if (loading || !user) return { isAdmin: false, loading };

    const role = user.user_metadata?.rol || user.app_metadata?.rol;
    return { isAdmin: role === 'admin', loading: false };
}
