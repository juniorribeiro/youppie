"use client";

import { HelpCircle } from 'lucide-react';
import { useTour } from '@/hooks/useTour';
import { useAuthStore } from '@/store/auth';

interface TourButtonProps {
    tourId: string;
}

export default function TourButton({ tourId }: TourButtonProps) {
    const { restartTour } = useTour();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

    if (!isAuthenticated) {
        return null;
    }

    const handleClick = () => {
        restartTour(tourId);
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Ajuda - Iniciar tour guiado"
            title="Ajuda - Iniciar tour guiado"
        >
            <HelpCircle className="w-6 h-6" />
        </button>
    );
}

