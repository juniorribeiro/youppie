import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @IsString()
    @IsOptional()
    user_id?: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @IsBoolean()
    @IsOptional()
    auto_open?: boolean;
}

export class UpdateNotificationDto {
    @IsBoolean()
    @IsOptional()
    is_read?: boolean;
}

