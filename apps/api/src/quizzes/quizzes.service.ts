import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class QuizzesService {
    constructor(
        private prisma: PrismaService,
        private subscriptionsService: SubscriptionsService,
    ) { }

    async create(userId: string, createQuizDto: CreateQuizDto) {
        // Verificar limite de quizzes
        await this.checkQuizLimit(userId);

        // Validar que title existe e é uma string não vazia
        if (!createQuizDto.title || typeof createQuizDto.title !== 'string' || !createQuizDto.title.trim()) {
            throw new BadRequestException('Title is required and must be a non-empty string');
        }

        const slug = this.generateSlug(createQuizDto.title);
        return this.prisma.quiz.create({
            data: {
                ...createQuizDto,
                slug,
                user_id: userId,
            },
        });
    }

    async checkQuizLimit(userId: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                quizzes: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verificar se a assinatura ainda está ativa (não expirou)
        const isSubscriptionActive = 
            user.subscription_status === 'active' ||
            (user.subscription_current_period_end && 
             new Date(user.subscription_current_period_end) > new Date());

        // Se não está ativa, usar plano FREE
        const effectivePlan = isSubscriptionActive 
            ? user.subscription_plan 
            : 'FREE';

        const planLimit = await this.subscriptionsService.getPlanLimits(effectivePlan as any);
        const currentQuizCount = user.quizzes.length;

        if (currentQuizCount >= planLimit) {
            throw new BadRequestException({
                code: 'QUIZ_LIMIT_REACHED',
                message: `Você atingiu o limite de ${planLimit} quiz(zes) do seu plano atual. Faça upgrade para criar mais quizzes.`,
                currentPlan: effectivePlan,
                limit: planLimit,
            });
        }
    }

    async findAll(userId: string) {
        return this.prisma.quiz.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(userId: string, id: string) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
        });
        if (!quiz) throw new NotFoundException('Quiz not found');
        if (quiz.user_id !== userId) throw new ForbiddenException('You do not own this quiz');
        return quiz;
    }

    async findBySlug(slug: string) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { slug },
            include: {
                steps: {
                    orderBy: { order: 'asc' },
                    include: {
                        question: {
                            include: {
                                options: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        google_analytics_id: true,
                        google_tag_manager_id: true,
                        facebook_pixel_id: true,
                        tracking_head: true,
                        tracking_body: true,
                        tracking_footer: true,
                    }
                }
            }
        });
        if (!quiz) throw new NotFoundException('Quiz not found');
        if (!quiz.is_published) throw new ForbiddenException('Quiz is not published');
        return quiz;
    }

    async update(userId: string, id: string, updateQuizDto: UpdateQuizDto) {
        await this.findOne(userId, id); // check ownership

        const { is_published, auto_advance, ...data } = updateQuizDto;

        const updateData = {
            ...data,
            ...(is_published !== undefined && { is_published }),
            ...(auto_advance !== undefined && { auto_advance }),
        };

        const result = await this.prisma.quiz.update({
            where: { id },
            data: updateData,
        });

        return result;
    }

    async remove(userId: string, id: string) {
        await this.findOne(userId, id); // check ownership
        return this.prisma.quiz.delete({
            where: { id },
        });
    }

    private generateSlug(title: string): string {
        // Validação defensiva adicional
        if (!title || typeof title !== 'string') {
            throw new BadRequestException('Title must be a non-empty string to generate slug');
        }

        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7);
    }
}
