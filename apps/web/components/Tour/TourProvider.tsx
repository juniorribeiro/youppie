"use client";

import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTourStore } from '@/store/tour';
import { useTour } from '@/hooks/useTour';
import { useAuthStore } from '@/store/auth';

interface TourProviderProps {
    tourId: string;
    steps: Step[];
    children: React.ReactNode;
}

export default function TourProvider({ tourId, steps, children }: TourProviderProps) {
    const { run, currentTourId, setCompleted, stopTour } = useTourStore();
    const { checkTourStatus, completeTour } = useTour();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || isChecking) return;

        const checkAndStartTour = async () => {
            // Só verifica se o tour atual não está rodando ou não corresponde ao tourId
            if (!run || currentTourId !== tourId) {
                const completed = await checkTourStatus(tourId);
                if (!completed) {
                    // Aguardar um pouco para garantir que o DOM está renderizado
                    setTimeout(() => {
                        useTourStore.getState().startTour(tourId);
                    }, 300);
                }
            }
        };

        checkAndStartTour();
    }, [isAuthenticated, tourId, checkTourStatus, currentTourId, isChecking, run, steps]);

    useEffect(() => {
        // Marca como não está mais verificando após um pequeno delay
        // para garantir que a autenticação foi processada
        const timer = setTimeout(() => {
            setIsChecking(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status, action } = data;

        // Lidar com status de conclusão
        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            setCompleted(true);
            stopTour();
            
            if (status === STATUS.FINISHED) {
                await completeTour(tourId);
            }
            return;
        }

        // Lidar com ações do usuário
        if (action === 'close' || action === 'skip') {
            setCompleted(true);
            stopTour();
            return;
        }

        // Com continuous=true, o Joyride gerencia o stepIndex automaticamente
        // Não precisamos atualizar manualmente
    };

    return (
        <>
            <Joyride
                steps={steps}
                run={run && currentTourId === tourId}
                continuous
                showProgress
                showSkipButton
                disableCloseOnEsc={false}
                disableOverlayClose={false}
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        primaryColor: '#6366f1', // primary color
                        zIndex: 10000,
                    },
                    overlay: {
                        mixBlendMode: 'normal',
                    },
                }}
                locale={{
                    back: 'Voltar',
                    close: 'Fechar',
                    last: 'Finalizar',
                    next: 'Próximo',
                    skip: 'Pular',
                }}
            />
            {children}
        </>
    );
}

