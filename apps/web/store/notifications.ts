import { create } from 'zustand';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from './auth';

export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface Notification {
    id: string;
    user_id: string | null;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    auto_open: boolean;
    created_at: string;
}

export interface Toast {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    toasts: Toast[];
    isLoading: boolean;
    lastCheckedAt: string | null;
    
    // Actions
    fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
    reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    toasts: [],
    isLoading: false,
    lastCheckedAt: null,

    fetchNotifications: async (unreadOnly = false) => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ isLoading: true });
        try {
            const query = unreadOnly ? '?unread=true' : '';
            const data = await apiFetch<Notification[]>(`/notifications${query}`, { token });
            set({ notifications: data, isLoading: false });
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            set({ isLoading: false });
        }
    },

    fetchUnreadCount: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        try {
            const response = await apiFetch<{ count: number }>('/notifications/unread-count', { token });
            const previousCount = get().unreadCount;
            const newCount = response.count;
            
            set({ 
                unreadCount: newCount,
                lastCheckedAt: new Date().toISOString()
            });

            // Se o número aumentou, buscar notificações não lidas para mostrar toast
            if (newCount > previousCount && previousCount > 0) {
                const data = await apiFetch<Notification[]>('/notifications?unread=true', { token });
                const previousNotifications = get().notifications;
                const previousIds = new Set(previousNotifications.filter(n => !n.is_read).map(n => n.id));
                
                // Encontrar novas notificações
                const newNotifications = data.filter(n => !previousIds.has(n.id));
                
                // Adicionar toast para cada nova notificação
                newNotifications.forEach(notif => {
                    get().addToast({
                        title: notif.title,
                        message: notif.message,
                        type: notif.type,
                    });
                });
                
                set({ notifications: data });
            } else if (previousCount === 0 && newCount > 0) {
                // Primeira vez que há notificações, buscar para atualizar lista
                get().fetchNotifications(true);
            }
        } catch (error) {
            console.error('Erro ao buscar contador de não lidas:', error);
        }
    },

    markAsRead: async (id: string) => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        try {
            await apiFetch(`/notifications/${id}/read`, { 
                method: 'PUT', 
                token 
            });
            
            set(state => ({
                notifications: state.notifications.map(n => 
                    n.id === id ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    },

    markAllAsRead: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        try {
            await apiFetch('/notifications/read-all', { 
                method: 'PUT', 
                token 
            });
            
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    },

    addToast: (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        set(state => ({
            toasts: [...state.toasts, { ...toast, id }]
        }));
    },

    removeToast: (id: string) => {
        set(state => ({
            toasts: state.toasts.filter(t => t.id !== id)
        }));
    },

    clearToasts: () => {
        set({ toasts: [] });
    },

    reset: () => {
        set({
            notifications: [],
            unreadCount: 0,
            toasts: [],
            isLoading: false,
            lastCheckedAt: null,
        });
    },
}));
