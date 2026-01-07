import { StepType } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsObject, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionOptionDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    @IsNotEmpty()
    value: string;
}

class QuestionDto {
    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsString()
    stepId?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionOptionDto)
    options: QuestionOptionDto[];
}

export class CreateStepDto {
    @IsString()
    @IsNotEmpty()
    quizId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    order: number;

    @IsEnum(StepType)
    type: StepType;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    // If type is QUESTION
    @IsOptional()
    @ValidateNested()
    @Type(() => QuestionDto)
    question?: QuestionDto;
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
