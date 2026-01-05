export class CreateQuizDto {
    title: string;
    description?: string;
    auto_advance?: boolean;
}

export class UpdateQuizDto {
    title?: string;
    description?: string;
    is_published?: boolean;
    auto_advance?: boolean;
}
