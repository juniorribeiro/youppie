import { create } from 'zustand';

interface TourState {
    currentTourId: string | null;
    run: boolean;
    stepIndex: number;
    completed: boolean;
    startTour: (tourId: string) => void;
    stopTour: () => void;
    setStepIndex: (index: number) => void;
    setCompleted: (completed: boolean) => void;
    reset: () => void;
}

export const useTourStore = create<TourState>((set) => ({
    currentTourId: null,
    run: false,
    stepIndex: 0,
    completed: false,
    startTour: (tourId: string) => set({ currentTourId: tourId, run: true, stepIndex: 0, completed: false }),
    stopTour: () => set({ run: false }),
    setStepIndex: (index: number) => set({ stepIndex: index }),
    setCompleted: (completed: boolean) => set({ completed }),
    reset: () => set({ currentTourId: null, run: false, stepIndex: 0, completed: false }),
}));

