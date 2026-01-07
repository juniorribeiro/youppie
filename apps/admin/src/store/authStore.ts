import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Admin {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    token: string | null;
    admin: Admin | null;
    setAuth: (token: string, admin: Admin) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            admin: null,
            setAuth: (token, admin) => {
                set({ token, admin });
                localStorage.setItem('admin_token', token);
                localStorage.setItem('admin_user', JSON.stringify(admin));
            },
            logout: () => {
                set({ token: null, admin: null });
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
            },
            isAuthenticated: () => !!get().token,
        }),
        {
            name: 'admin-auth-storage',
        }
    )
);

