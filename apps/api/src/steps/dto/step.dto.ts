import { StepType } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsObject, ValidateNested, IsArray, IsBoolean, Min, Max, IsIn } from 'class-validator';
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

class MultipleChoiceMetadataDto {
    @IsOptional()
    @IsBoolean()
    multipleChoice?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(1)
    minSelections?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    maxSelections?: number | null;
}

export class InputMetadataDto {
    @IsString()
    @IsNotEmpty()
    variableName: string;

    @IsString()
    @IsIn(['text', 'number', 'email'])
    inputType: 'text' | 'number' | 'email';
}

export class ConditionDto {
    @IsString()
    @IsIn(['answer', 'variable'])
    type: 'answer' | 'variable';

    @IsString()
    @IsNotEmpty()
    source: string; // stepId (para answer) ou variableName (para variable)

    @IsString()
    @IsIn(['==', '!=', '>', '<', '>=', '<=', 'in', 'notIn'])
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'notIn';

    value: any; // valor de comparação
}

export class ActionDto {
    @IsString()
    @IsIn(['goto', 'skip', 'message', 'score', 'end', 'redirect', 'setVariable'])
    type: 'goto' | 'skip' | 'message' | 'score' | 'end' | 'redirect' | 'setVariable';

    @IsOptional()
    @IsString()
    target?: string; // stepId para goto, variableName para setVariable

    value?: any; // valor para score, message text, redirect URL, variable value
}

export class RuleDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConditionDto)
    conditions: ConditionDto[];

    @IsOptional()
    @IsString()
    @IsIn(['AND', 'OR'])
    logic?: 'AND' | 'OR';

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ActionDto)
    actions: ActionDto[];

    @IsOptional()
    @IsNumber()
    priority?: number;
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
    metadata?: Record<string, any> | MultipleChoiceMetadataDto;

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
