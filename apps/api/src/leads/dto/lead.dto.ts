export class GetLeadsQueryDto {
    quizId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export class ExportLeadsQueryDto {
    format: 'csv' | 'excel';
    quizId?: string;
    startDate?: string;
    endDate?: string;
}

