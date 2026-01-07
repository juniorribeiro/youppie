export interface QuizAnalytics {
    id: string;
    title: string;
    slug: string;
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    completionRate: number;
}

export interface QuizzesAnalyticsResponse {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    completionRate: number;
    quizzes: QuizAnalytics[];
}

export interface StepAnalytics {
    stepId: string;
    stepOrder: number;
    stepTitle: string;
    stepType: string;
    usersReached: number;
    usersCurrentlyHere: number;
    dropoffRate: number;
}

export interface QuizDetailAnalyticsResponse {
    quiz: {
        id: string;
        title: string;
        slug: string;
    };
    overview: {
        totalSessions: number;
        activeSessions: number;
        completedSessions: number;
        completionRate: number;
    };
    steps: StepAnalytics[];
}

