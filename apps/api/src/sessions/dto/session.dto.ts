export class StartSessionDto {
    quizId: string;
    lead?: {
        email: string;
        name?: string;
        phone?: string;
        data?: any;
    };
}

export class SubmitAnswerDto {
    stepId: string;
    value: any; // JSON value
}

export class CreateSessionLeadDto {
    email: string;
    name?: string;
    phone?: string;
}
