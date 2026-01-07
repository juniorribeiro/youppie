export class QuizAnalyticsDto {
    id: string;
    title: string;
    slug: string;
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    completionRate: number;
}

export class QuizzesAnalyticsResponseDto {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    completionRate: number;
    quizzes: QuizAnalyticsDto[];
}

export class StepAnalyticsDto {
    stepId: string;
    stepOrder: number;
    stepTitle: string;
    stepType: string;
    usersReached: number;
    usersCurrentlyHere: number;
    dropoffRate: number;
}

export class QuizDetailAnalyticsResponseDto {
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
    steps: StepAnalyticsDto[];
}

