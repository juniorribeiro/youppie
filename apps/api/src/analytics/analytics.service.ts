import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    QuizzesAnalyticsResponseDto,
    QuizDetailAnalyticsResponseDto,
    QuizAnalyticsDto,
    StepAnalyticsDto,
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getQuizzesAnalytics(userId: string): Promise<QuizzesAnalyticsResponseDto> {
        // Buscar todos os quizzes do usuário
        const quizzes = await this.prisma.quiz.findMany({
            where: { user_id: userId },
            select: {
                id: true,
                title: true,
                slug: true,
            },
        });

        const quizIds = quizzes.map(q => q.id);

        if (quizIds.length === 0) {
            return {
                totalSessions: 0,
                activeSessions: 0,
                completedSessions: 0,
                completionRate: 0,
                quizzes: [],
            };
        }

        // Buscar todas as sessões dos quizzes do usuário
        const allSessions = await this.prisma.session.findMany({
            where: {
                quiz_id: { in: quizIds },
            },
        });

        // Calcular métricas gerais
        const totalSessions = allSessions.length;
        const activeSessions = allSessions.filter(s => !s.completed_at).length;
        const completedSessions = allSessions.filter(s => s.completed_at !== null).length;
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

        // Calcular métricas por quiz
        const quizzesAnalytics: QuizAnalyticsDto[] = await Promise.all(
            quizzes.map(async (quiz) => {
                const quizSessions = allSessions.filter(s => s.quiz_id === quiz.id);
                const quizTotal = quizSessions.length;
                const quizActive = quizSessions.filter(s => !s.completed_at).length;
                const quizCompleted = quizSessions.filter(s => s.completed_at !== null).length;
                const quizCompletionRate = quizTotal > 0 ? (quizCompleted / quizTotal) * 100 : 0;

                return {
                    id: quiz.id,
                    title: quiz.title,
                    slug: quiz.slug,
                    totalSessions: quizTotal,
                    activeSessions: quizActive,
                    completedSessions: quizCompleted,
                    completionRate: Math.round(quizCompletionRate * 100) / 100,
                };
            })
        );

        return {
            totalSessions,
            activeSessions,
            completedSessions,
            completionRate: Math.round(completionRate * 100) / 100,
            quizzes: quizzesAnalytics,
        };
    }

    async getQuizAnalytics(quizId: string, userId: string): Promise<QuizDetailAnalyticsResponseDto> {
        // Verificar se o quiz existe e pertence ao usuário
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                steps: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        order: true,
                        title: true,
                        type: true,
                    },
                },
            },
        });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        if (quiz.user_id !== userId) {
            throw new ForbiddenException('You do not have access to this quiz');
        }

        // Buscar todas as sessões deste quiz
        const sessions = await this.prisma.session.findMany({
            where: { quiz_id: quizId },
        });

        // Calcular métricas gerais
        const totalSessions = sessions.length;
        const activeSessions = sessions.filter(s => !s.completed_at).length;
        const completedSessions = sessions.filter(s => s.completed_at !== null).length;
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

        // Calcular métricas por step
        const stepsAnalytics: StepAnalyticsDto[] = quiz.steps.map((step, index) => {
            // Sessões que chegaram neste step (têm resposta para este step ou steps anteriores)
            let usersReached = 0;
            let usersCurrentlyHere = 0;
            let usersWhoCompleted = 0;

            sessions.forEach((session) => {
                const answers = (session.answers as any) || {};
                const answeredStepIds = Object.keys(answers);
                const isCompleted = session.completed_at !== null;

                // Para o primeiro step (index 0), todas as sessões chegaram (é o ponto de entrada)
                if (index === 0) {
                    usersReached++;
                    // Se não tem respostas e não completou, está atualmente no primeiro step
                    if (answeredStepIds.length === 0 && !isCompleted) {
                        usersCurrentlyHere++;
                    }
                    // Se completou, contabilizar como completou neste step
                    if (isCompleted) {
                        usersWhoCompleted++;
                    }
                } else {
                    // Para outros steps, verificar se chegou neste step
                    // Uma sessão completada passou por todos os steps, então sempre chegou
                    // Para sessões não completadas, verificar se respondeu este step ou algum step posterior
                    let reachedThisStep = false;
                    
                    if (isCompleted) {
                        // Sessão completada passou por todos os steps
                        reachedThisStep = true;
                    } else {
                        // Para sessões não completadas, verificar se respondeu este step ou algum step posterior
                        reachedThisStep = answeredStepIds.some((answeredStepId) => {
                            const answeredStepIndex = quiz.steps.findIndex(s => s.id === answeredStepId);
                            return answeredStepIndex >= index;
                        });
                    }

                    if (reachedThisStep) {
                        usersReached++;

                        // Se completou e chegou neste step, contabilizar como completou
                        if (isCompleted) {
                            usersWhoCompleted++;
                        }

                        // Verificar se está atualmente neste step
                        // Step atual = último stepId no objeto answers (maior order)
                        const currentStepId = this.getCurrentStepId(answers, quiz.steps);
                        if (currentStepId === step.id && !isCompleted) {
                            usersCurrentlyHere++;
                        }
                    }
                }
            });

            // Calcular taxa de abandono
            // Abandono = (usuários que chegaram mas não completaram) / total que chegaram
            const dropoffRate = usersReached > 0
                ? ((usersReached - usersWhoCompleted) / usersReached) * 100
                : 0;

            return {
                stepId: step.id,
                stepOrder: step.order,
                stepTitle: step.title,
                stepType: step.type,
                usersReached,
                usersCurrentlyHere,
                dropoffRate: Math.round(dropoffRate * 100) / 100,
            };
        });

        return {
            quiz: {
                id: quiz.id,
                title: quiz.title,
                slug: quiz.slug,
            },
            overview: {
                totalSessions,
                activeSessions,
                completedSessions,
                completionRate: Math.round(completionRate * 100) / 100,
            },
            steps: stepsAnalytics,
        };
    }

    /**
     * Determina o step atual baseado no último stepId presente no objeto answers
     * O step atual é o step com maior order que tem resposta no answers
     */
    private getCurrentStepId(answers: any, steps: Array<{ id: string; order: number }>): string | null {
        const answeredStepIds = Object.keys(answers);
        if (answeredStepIds.length === 0) return null;

        // Encontrar o step com maior order que tem resposta
        let maxOrder = -1;
        let currentStepId: string | null = null;

        answeredStepIds.forEach((stepId) => {
            const step = steps.find(s => s.id === stepId);
            if (step && step.order > maxOrder) {
                maxOrder = step.order;
                currentStepId = step.id;
            }
        });

        return currentStepId;
    }
}

