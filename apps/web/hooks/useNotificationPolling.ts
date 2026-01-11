"use client";

import { useEffect, useRef } from "react";
import { useNotificationsStore } from "@/store/notifications";
import { useAuthStore } from "@/store/auth";

const POLLING_INTERVAL = 60000; // 60 segundos

export function useNotificationPolling() {
    const token = useAuthStore((state) => state.token);
    const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Não fazer polling se não estiver autenticado
        if (!token) {
            // Limpar intervalo se existir
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Buscar imediatamente ao montar
        fetchUnreadCount();

        // Configurar polling
        intervalRef.current = setInterval(() => {
            // Verificar se ainda tem token antes de fazer polling
            const currentToken = useAuthStore.getState().token;
            if (currentToken) {
                fetchUnreadCount();
            }
        }, POLLING_INTERVAL);

        // Cleanup: parar polling quando componente desmontar
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [token, fetchUnreadCount]);

    // Pausar polling quando a aba estiver inativa (opcional, mas melhor para performance)
    useEffect(() => {
        if (!token) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Pausar quando aba estiver inativa
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } else {
                // Retomar quando aba estiver ativa
                const currentToken = useAuthStore.getState().token;
                if (currentToken && !intervalRef.current) {
                    fetchUnreadCount();
                    intervalRef.current = setInterval(() => {
                        const checkToken = useAuthStore.getState().token;
                        if (checkToken) {
                            fetchUnreadCount();
                        }
                    }, POLLING_INTERVAL);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [token, fetchUnreadCount]);
}
