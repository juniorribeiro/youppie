import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsObject } from 'class-validator';
import { OverrideType } from '@prisma/client';

export class CreateUserOverrideDto {
    @IsString()
    @IsNotEmpty()
    user_id: string;

    @IsEnum(OverrideType)
    override_type: OverrideType;

    @IsDateString()
    @IsOptional()
    expires_at?: string;

    @IsObject()
    @IsOptional()
    metadata?: any;
}

export class UpdateUserOverrideDto {
    @IsDateString()
    @IsOptional()
    expires_at?: string;

    @IsObject()
    @IsOptional()
    metadata?: any;
}

