import { StepType } from '@prisma/client';

export class CreateStepDto {
    quizId: string;
    title: string;
    order: number;
    type: StepType;
    content?: string;
    metadata?: Record<string, any>;
    // If type is QUESTION
    question?: {
        text?: string;
        stepId?: string; // usually inferred
        options: {
            text: string;
            value: string;
        }[];
    };
}

export class UpdateStepDto {
    title?: string;
    order?: number;
    content?: string;
    metadata?: Record<string, any>;
    question?: {
        text?: string;
        options?: {
            id?: string;
            text: string;
            value: string;
        }[];
    };
}
