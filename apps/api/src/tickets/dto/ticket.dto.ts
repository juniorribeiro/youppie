import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateTicketMessageDto {
    @IsString()
    @IsNotEmpty()
    message: string;
}

export class UpdateTicketStatusDto {
    @IsEnum(TicketStatus)
    status: TicketStatus;
}

export class UpdateTicketPriorityDto {
    @IsEnum(TicketPriority)
    priority: TicketPriority;
}

