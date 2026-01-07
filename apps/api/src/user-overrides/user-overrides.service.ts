import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserOverrideDto, UpdateUserOverrideDto } from './dto/user-override.dto';

@Injectable()
export class UserOverridesService {
    constructor(private prisma: PrismaService) {}

    async create(adminId: string, createOverrideDto: CreateUserOverrideDto) {
        const expiresAt = createOverrideDto.expires_at
            ? new Date(createOverrideDto.expires_at)
            : null;

        return this.prisma.userOverride.create({
            data: {
                user_id: createOverrideDto.user_id,
                override_type: createOverrideDto.override_type,
                expires_at: expiresAt,
                metadata: createOverrideDto.metadata || {},
                created_by: adminId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findAll(userId?: string, overrideType?: string) {
        const where: any = {};

        if (userId) {
            where.user_id = userId;
        }

        if (overrideType) {
            where.override_type = overrideType;
        }

        const now = new Date();
        where.OR = [
            { expires_at: null },
            { expires_at: { gt: now } },
        ];

        return this.prisma.userOverride.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                admin: {
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

    async findOne(id: string) {
        const override = await this.prisma.userOverride.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!override) {
            throw new NotFoundException('Override not found');
        }

        return override;
    }

    async update(id: string, updateOverrideDto: UpdateUserOverrideDto) {
        const override = await this.findOne(id);

        const expiresAt = updateOverrideDto.expires_at
            ? new Date(updateOverrideDto.expires_at)
            : override.expires_at;

        return this.prisma.userOverride.update({
            where: { id },
            data: {
                expires_at: expiresAt,
                metadata: updateOverrideDto.metadata !== undefined
                    ? updateOverrideDto.metadata
                    : override.metadata,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async delete(id: string) {
        const override = await this.findOne(id);

        return this.prisma.userOverride.delete({
            where: { id },
        });
    }

    async getActiveOverridesForUser(userId: string) {
        const now = new Date();

        return this.prisma.userOverride.findMany({
            where: {
                user_id: userId,
                OR: [
                    { expires_at: null },
                    { expires_at: { gt: now } },
                ],
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
}

