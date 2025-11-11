import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/**
 * Hook personalizado para gestionar la autenticación
 * @returns Objeto con el estado de autenticación y funciones para login/logout
 */
export const useAuth = () => {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const user = useAuthStore((state) => state.user);
    const session = useAuthStore((state) => state.session);
    const login = useAuthStore((state) => state.login);
    const logoutStore = useAuthStore((state) => state.logout);
    const updateUser = useAuthStore((state) => state.updateUser);

    const logout = async () => {
        await supabase.auth.signOut();
        logoutStore();
        router.replace("/login");
    };

    return {
        isAuthenticated,
        isLoading,
        user,
        session,
        login,
        logout,
        updateUser,
    };
};
