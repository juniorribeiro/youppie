export class StartSessionDto {
    quizId: string;
    lead?: {
        email: string;
        name?: string;
        data?: any;
    };
}

export class SubmitAnswerDto {
    stepId: string;
    value: any; // JSON value
}
