import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsObject, ValidateIf, ValidateNested, IsEmail } from 'class-validator';
import { OverrideType } from '@prisma/client';
import { SubscriptionPlan } from '../../subscriptions/dto/subscription.dto';
import { Type } from 'class-transformer';

class PlanMetadataDto {
    @IsEnum(SubscriptionPlan)
    plan: SubscriptionPlan;
}

export class CreateUserOverrideDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    user_email: string;

    @IsEnum(OverrideType)
    override_type: OverrideType;

    @IsDateString()
    @IsOptional()
    expires_at?: string;

    @ValidateIf((o) => o.override_type === 'PLAN_LIMITS')
    @IsObject()
    @ValidateNested()
    @Type(() => PlanMetadataDto)
    @IsNotEmpty()
    metadata?: PlanMetadataDto;
}

export class UpdateUserOverrideDto {
    @IsDateString()
    @IsOptional()
    expires_at?: string;

    @IsObject()
    @IsOptional()
    metadata?: any;
}

