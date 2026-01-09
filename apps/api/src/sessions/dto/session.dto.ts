import { IsString, IsNotEmpty, IsOptional, IsEmail, IsObject, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

class LeadDto {
    @IsEmail({}, { message: 'O e-mail deve ser um endereço válido' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsOptional()
    data?: any;
}

export class StartSessionDto {
    @IsString()
    @IsNotEmpty()
    quizId: string;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => LeadDto)
    lead?: LeadDto;
}

export class SubmitAnswerDto {
    @IsString()
    @IsNotEmpty()
    stepId: string;

    @IsOptional()
    value: any; // JSON value
}

export class CreateSessionLeadDto {
    @Transform(({ value }) => {
        // Convert empty string to undefined so @IsOptional() works correctly
        if (value === '' || value === null) {
            return undefined;
        }
        return value;
    })
    @IsOptional()
    @IsEmail({}, { message: 'O e-mail deve ser um endereço válido' })
    email?: string;

    @Transform(({ value }) => {
        if (value === '' || value === null) {
            return undefined;
        }
        return value;
    })
    @IsString()
    @IsOptional()
    name?: string;

    @Transform(({ value }) => {
        if (value === '' || value === null) {
            return undefined;
        }
        return value;
    })
    @IsString()
    @IsOptional()
    phone?: string;
}
