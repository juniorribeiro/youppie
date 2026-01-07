import { useCallback } from 'react';
import { useTourStore } from '@/store/tour';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function useTour() {
    const { startTour: startTourStore, reset } = useTourStore();
    const token = useAuthStore((state) => state.token);

    const startTour = useCallback(
        async (tourId: string) => {
            startTourStore(tourId);
        },
        [startTourStore]
    );

    const restartTour = useCallback(
        async (tourId: string) => {
            // Ignora o status e inicia o tour manualmente
            startTourStore(tourId);
        },
        [startTourStore]
    );

    const completeTour = useCallback(
        async (tourId: string) => {
            if (!token) return;

            try {
                await apiFetch('/tours/complete', {
                    method: 'POST',
                    token,
                    body: JSON.stringify({ tour_id: tourId }),
                });
            } catch (error) {
                console.error('Erro ao completar tour:', error);
            }
        },
        [token]
    );

    const checkTourStatus = useCallback(
        async (tourId: string): Promise<boolean> => {
            if (!token) return false;

            try {
                const response = await apiFetch<{ completed: boolean }>(`/tours/${tourId}/status`, {
                    token,
                });
                return response.completed;
            } catch (error) {
                console.error('Erro ao verificar status do tour:', error);
                return false;
            }
        },
        [token]
    );

    return {
        startTour,
        restartTour,
        completeTour,
        checkTourStatus,
        reset,
    };
}

