import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, IsEnum, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuizDto } from './quiz.dto';

export class AnswerOptionImportDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    @IsNotEmpty()
    value: string;
}

export class QuestionImportDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerOptionImportDto)
    options: AnswerOptionImportDto[];
}

export class StepImportDto {
    @IsNumber()
    order: number;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    image_url?: string;

    @IsString()
    @IsOptional()
    image_base64?: string;

    @IsObject()
    @IsOptional()
    metadata?: any;

    @IsObject()
    @ValidateNested()
    @Type(() => QuestionImportDto)
    @IsOptional()
    question?: QuestionImportDto;
}

export class ResultPageImportDto {
    @IsString()
    @IsNotEmpty()
    headline_template: string;

    @IsString()
    @IsNotEmpty()
    body_template: string;

    @IsString()
    @IsNotEmpty()
    cta_text: string;

    @IsString()
    @IsNotEmpty()
    cta_url: string;
}

export class QuizExportDataDto {
    @IsString()
    @IsNotEmpty()
    version: string;

    @IsString()
    @IsNotEmpty()
    exportedAt: string;

    @IsObject()
    @ValidateNested()
    @Type(() => Object)
    exportedBy: {
        email: string;
        name?: string;
        id: string;
    };

    @IsObject()
    @ValidateNested()
    @Type(() => Object)
    quiz: {
        title: string;
        description?: string;
        language: string;
        capture_mode: string;
        is_published: boolean;
        auto_advance: boolean;
        created_at?: string;
    };

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StepImportDto)
    steps: StepImportDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ResultPageImportDto)
    @IsOptional()
    resultPages?: ResultPageImportDto[];
}

export class ImportOptionsDto {
    @IsEnum(['create', 'replace'])
    importMode: 'create' | 'replace';

    @IsString()
    @IsOptional()
    newSlug?: string;

    @IsString()
    @IsOptional()
    existingQuizId?: string; // Se replace, precisa do ID do quiz existente
}

export class QuizImportPreviewDto {
    quiz: {
        title: string;
        description?: string;
        language: string;
        capture_mode: string;
        is_published: boolean;
        auto_advance: boolean;
    };
    stepsCount: number;
    resultPagesCount: number;
    slugConflict: boolean;
    existingSlug?: string;
    warnings: string[];
    errors: string[];
}
