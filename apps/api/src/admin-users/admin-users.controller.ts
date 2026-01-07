import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/users')
@UseGuards(AdminAuthGuard)
export class AdminUsersController {
    constructor(
        private usersService: UsersService,
        private prisma: PrismaService,
    ) {}

    @Get()
    async findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('search') search?: string,
        @Query('plan') plan?: string,
    ) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (plan) {
            where.subscription_plan = plan;
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar_url: true,
                    subscription_plan: true,
                    subscription_status: true,
                    created_at: true,
                    _count: {
                        select: {
                            quizzes: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        quizzes: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

