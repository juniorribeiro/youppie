import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) {}

    async create(createNotificationDto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                user_id: createNotificationDto.user_id || null,
                title: createNotificationDto.title,
                message: createNotificationDto.message,
                type: createNotificationDto.type || 'INFO',
                auto_open: createNotificationDto.auto_open || false,
            },
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
    }

    async findAll(userId?: string) {
        const where: any = {};
        if (userId) {
            where.user_id = userId;
        } else {
            where.user_id = null;
        }

        return this.prisma.notification.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findUserNotifications(userId: string, unreadOnly: boolean = false) {
        const where: any = {
            OR: [
                { user_id: userId },
                { user_id: null },
            ],
        };

        if (unreadOnly) {
            where.is_read = false;
        }

        return this.prisma.notification.findMany({
            where,
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string, userId?: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
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

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        if (userId && notification.user_id && notification.user_id !== userId) {
            throw new NotFoundException('Notification not found');
        }

        return notification;
    }

    async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto) {
        const notification = await this.findOne(id, userId);

        return this.prisma.notification.update({
            where: { id },
            data: updateNotificationDto,
        });
    }

    async markAsRead(id: string, userId: string) {
        return this.update(id, userId, { is_read: true });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: {
                OR: [
                    { user_id: userId },
                    { user_id: null },
                ],
                is_read: false,
            },
            data: { is_read: true },
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: {
                OR: [
                    { user_id: userId },
                    { user_id: null },
                ],
                is_read: false,
            },
        });
    }

    async delete(id: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return this.prisma.notification.delete({
            where: { id },
        });
    }
}

