import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { AlertType } from '@prisma/client';

export class CreateSystemAlertDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsEnum(AlertType)
    @IsOptional()
    type?: AlertType;

    @IsBoolean()
    @IsOptional()
    dismissible?: boolean;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdateSystemAlertDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    message?: string;

    @IsEnum(AlertType)
    @IsOptional()
    type?: AlertType;

    @IsBoolean()
    @IsOptional()
    dismissible?: boolean;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

