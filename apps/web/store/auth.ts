import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string | null;
    subscription_plan?: string;
    subscription_status?: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    updateUser: (partialUser: Partial<User>) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            setAuth: (token, user) => set({ token, user }),
            updateUser: (partialUser) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...partialUser } });
                }
            },
            logout: () => set({ token: null, user: null }),
            isAuthenticated: () => !!get().token,
        }),
        {
            name: 'auth-storage',
        }
    )
);
