import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserOverrideDto, UpdateUserOverrideDto } from './dto/user-override.dto';
import { SubscriptionPlan } from '../subscriptions/dto/subscription.dto';

@Injectable()
export class UserOverridesService {
    constructor(private prisma: PrismaService) {}

    async create(adminId: string, createOverrideDto: CreateUserOverrideDto) {
        // Validação: se override_type é PLAN_LIMITS, metadata deve conter o campo plan
        if (createOverrideDto.override_type === 'PLAN_LIMITS') {
            if (!createOverrideDto.metadata || !createOverrideDto.metadata.plan) {
                throw new BadRequestException('metadata.plan is required when override_type is PLAN_LIMITS');
            }
            // Validar que o plano é válido
            const validPlans = Object.values(SubscriptionPlan);
            if (!validPlans.includes(createOverrideDto.metadata.plan)) {
                throw new BadRequestException(`Invalid plan: ${createOverrideDto.metadata.plan}. Valid plans are: ${validPlans.join(', ')}`);
            }
        }

        const expiresAt = createOverrideDto.expires_at
            ? new Date(createOverrideDto.expires_at)
            : null;

        // Converter metadata para objeto JSON simples para o Prisma
        // O Prisma espera um objeto plano, não uma instância de classe
        const metadataJson = createOverrideDto.metadata 
            ? JSON.parse(JSON.stringify(createOverrideDto.metadata))
            : {};

        return this.prisma.userOverride.create({
            data: {
                user_id: createOverrideDto.user_id,
                override_type: createOverrideDto.override_type,
                expires_at: expiresAt,
                metadata: metadataJson,
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

        // Converter metadata para objeto JSON simples para o Prisma
        const metadataJson = updateOverrideDto.metadata !== undefined
            ? JSON.parse(JSON.stringify(updateOverrideDto.metadata))
            : override.metadata;

        return this.prisma.userOverride.update({
            where: { id },
            data: {
                expires_at: expiresAt,
                metadata: metadataJson,
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

    async getActivePlanOverrideForUser(userId: string) {
        const now = new Date();

        const override = await this.prisma.userOverride.findFirst({
            where: {
                user_id: userId,
                override_type: 'PLAN_LIMITS',
                OR: [
                    { expires_at: null },
                    { expires_at: { gt: now } },
                ],
            },
            orderBy: {
                created_at: 'desc', // Pega o mais recente se houver múltiplos
            },
        });

        return override;
    }
}

