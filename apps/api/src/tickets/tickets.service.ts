import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, CreateTicketMessageDto, UpdateTicketStatusDto, UpdateTicketPriorityDto } from './dto/ticket.dto';
import { SenderType, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TicketsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) {}

    async create(userId: string, createTicketDto: CreateTicketDto, attachmentUrl?: string) {
        return this.prisma.$transaction(async (tx) => {
            const ticket = await tx.ticket.create({
                data: {
                    user_id: userId,
                    subject: createTicketDto.subject,
                },
            });

            if (createTicketDto.description) {
                await tx.ticketMessage.create({
                    data: {
                        ticket_id: ticket.id,
                        sender_type: 'USER',
                        sender_id: userId,
                        message: createTicketDto.description,
                        attachment_url: attachmentUrl,
                    },
                });
            }

            return tx.ticket.findUnique({
                where: { id: ticket.id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    messages: {
                        orderBy: { created_at: 'asc' },
                    },
                },
            });
        });
    }

    async findAll(userId?: string, status?: string, priority?: string) {
        const where: any = {};
        if (userId) {
            where.user_id = userId;
        }
        if (status) {
            where.status = status;
        }
        if (priority) {
            where.priority = priority;
        }

        return this.prisma.ticket.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                messages: {
                    orderBy: { created_at: 'asc' },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string, userId?: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                messages: {
                    orderBy: { created_at: 'asc' },
                },
            },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        if (userId && ticket.user_id !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return ticket;
    }

    async updateStatus(id: string, updateStatusDto: UpdateTicketStatusDto) {
        return this.prisma.ticket.update({
            where: { id },
            data: { status: updateStatusDto.status },
        });
    }

    async updatePriority(id: string, updatePriorityDto: UpdateTicketPriorityDto) {
        return this.prisma.ticket.update({
            where: { id },
            data: { priority: updatePriorityDto.priority },
        });
    }

    async addMessage(
        ticketId: string,
        senderType: SenderType,
        senderId: string,
        message: string,
        attachmentUrl?: string,
    ) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        const ticketMessage = await this.prisma.ticketMessage.create({
            data: {
                ticket_id: ticketId,
                sender_type: senderType,
                sender_id: senderId,
                message,
                attachment_url: attachmentUrl,
            },
        });

        await this.prisma.ticket.update({
            where: { id: ticketId },
            data: { updated_at: new Date() },
        });

        // Criar notificação
        if (senderType === 'ADMIN') {
            // Admin respondeu - notificar usuário
            await this.notificationsService.create({
                user_id: ticket.user_id,
                title: `Nova resposta no ticket: ${ticket.subject}`,
                message: `Você recebeu uma nova resposta no seu ticket "${ticket.subject}".`,
                type: NotificationType.INFO,
            });
        } else if (senderType === 'USER') {
            // Usuário respondeu - notificar admins (notificação global com user_id null)
            await this.notificationsService.create({
                user_id: null,
                title: `Nova resposta no ticket: ${ticket.subject}`,
                message: `O usuário ${ticket.user.name} respondeu no ticket "${ticket.subject}".`,
                type: NotificationType.INFO,
            });
        }

        return ticketMessage;
    }
}

