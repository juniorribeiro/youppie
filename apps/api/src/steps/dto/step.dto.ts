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
    description?: string;

    @IsOptional()
    @IsString()
    image_url?: string;

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
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsNumber()
    order?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image_url?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @ValidateNested()
    @Type(() => QuestionDto)
    question?: {
        text?: string;
        options?: {
            id?: string;
            text: string;
            value: string;
        }[];
    };
}
