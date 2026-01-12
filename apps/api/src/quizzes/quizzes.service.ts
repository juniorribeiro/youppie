import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { QuizImportExportService } from './quiz-import-export.service';
import { QuizExportDataDto, ImportOptionsDto, QuizImportPreviewDto } from './dto/quiz-import.dto';
import { UserOverridesService } from '../user-overrides/user-overrides.service';
import { SubscriptionPlan } from '../subscriptions/dto/subscription.dto';

@Injectable()
export class QuizzesService {
    constructor(
        private prisma: PrismaService,
        private subscriptionsService: SubscriptionsService,
        private importExportService: QuizImportExportService,
        private userOverridesService: UserOverridesService,
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

        let effectivePlan: SubscriptionPlan;
        
        // PRIORIDADE 1: Verificar se existe override ativo do tipo PLAN_LIMITS
        const planOverride = await this.userOverridesService.getActivePlanOverrideForUser(userId);
        
        if (planOverride && planOverride.metadata && (planOverride.metadata as any).plan) {
            // Usar o plano do override
            effectivePlan = (planOverride.metadata as any).plan as SubscriptionPlan;
        } else {
            // PRIORIDADE 2: Verificar se a assinatura ainda está ativa (não expirou)
            const isSubscriptionActive = 
                user.subscription_status === 'active' ||
                (user.subscription_current_period_end && 
                 new Date(user.subscription_current_period_end) > new Date());

            // Se não está ativa, usar plano FREE
            effectivePlan = isSubscriptionActive 
                ? user.subscription_plan as SubscriptionPlan
                : SubscriptionPlan.FREE;
        }

        const planLimit = await this.subscriptionsService.getPlanLimits(effectivePlan);
        const currentQuizCount = user.quizzes.length;

        // Se o limite for null, significa ilimitado - não verificar
        if (planLimit === null) {
            return;
        }

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

    async findOne(userId: string, id: string, skipOwnershipCheck: boolean = false) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
        });
        if (!quiz) throw new NotFoundException('Quiz not found');
        if (!skipOwnershipCheck && quiz.user_id !== userId) throw new ForbiddenException('You do not own this quiz');
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

    private async generateSlugWithSuffix(baseTitle: string, baseSlug?: string): Promise<string> {
        if (!baseTitle || typeof baseTitle !== 'string') {
            throw new BadRequestException('Title must be a non-empty string to generate slug');
        }

        const slugBase = baseSlug || this.generateSlugFromTitle(baseTitle);

        // Verificar se slug base já existe
        const existingBase = await this.prisma.quiz.findUnique({
            where: { slug: slugBase },
            select: { id: true },
        });

        if (!existingBase) {
            return slugBase;
        }

        // Adicionar sufixo numérico
        let counter = 1;
        let newSlug = `${slugBase}-${counter}`;
        
        // Continuar incrementando até encontrar um slug único
        // Limitar a 100 tentativas para evitar loop infinito
        while (counter < 100) {
            const existing = await this.prisma.quiz.findUnique({
                where: { slug: newSlug },
                select: { id: true },
            });
            
            if (!existing) {
                return newSlug;
            }
            
            counter++;
            newSlug = `${slugBase}-${counter}`;
        }

        // Se chegou aqui, adicionar random como fallback
        return slugBase + '-' + Math.random().toString(36).substring(2, 7);
    }

    /**
     * Exporta um quiz completo com todos os dados
     */
    async exportQuiz(userId: string, quizId: string, isAdmin: boolean = false): Promise<QuizExportDataDto> {
        // Buscar quiz com verificação de permissão
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                steps: {
                    orderBy: { order: 'asc' },
                    include: {
                        question: {
                            include: {
                                options: true,
                            },
                        },
                    },
                },
                result_pages: true,
            },
        });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        // Verificar permissões (admin pode exportar qualquer quiz)
        if (!isAdmin && quiz.user_id !== userId) {
            throw new ForbiddenException('You do not have permission to export this quiz');
        }

        // Buscar informações do usuário que está exportando
        const exporter = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        if (!exporter) {
            throw new NotFoundException('User not found');
        }

        // Converter imagens para base64
        const stepsWithImages = await Promise.all(
            quiz.steps.map(async (step) => {
                let image_base64: string | null = null;
                
                if (step.image_url) {
                    image_base64 = await this.importExportService.convertImageUrlToBase64(step.image_url);
                }

                return {
                    order: step.order,
                    type: step.type,
                    title: step.title,
                    description: step.description || undefined,
                    image_url: step.image_url || undefined,
                    image_base64: image_base64 || undefined,
                    metadata: step.metadata || undefined,
                    question: step.question
                        ? {
                              text: step.question.text,
                              options: step.question.options.map((opt) => ({
                                  text: opt.text,
                                  value: opt.value,
                              })),
                          }
                        : undefined,
                };
            }),
        );

        // Montar estrutura de exportação
        const exportData: QuizExportDataDto = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            exportedBy: {
                email: exporter.email,
                name: exporter.name || undefined,
                id: exporter.id,
            },
            quiz: {
                title: quiz.title,
                description: quiz.description || undefined,
                language: quiz.language,
                capture_mode: quiz.capture_mode,
                is_published: quiz.is_published,
                auto_advance: quiz.auto_advance,
                created_at: quiz.created_at.toISOString(),
            },
            steps: stepsWithImages,
            resultPages:
                quiz.result_pages && quiz.result_pages.length > 0
                    ? quiz.result_pages.map((rp) => ({
                          headline_template: rp.headline_template,
                          body_template: rp.body_template,
                          cta_text: rp.cta_text,
                          cta_url: rp.cta_url,
                      }))
                    : undefined,
        };

        return exportData;
    }

    /**
     * Preview de importação - valida e retorna preview dos dados
     */
    async previewImport(userId: string, file: Express.Multer.File): Promise<QuizImportPreviewDto> {
        // Extrair JSON do arquivo
        const exportData = await this.importExportService.extractJsonFromFile(file);

        // Validar estrutura
        const validation = this.importExportService.validateExportData(exportData);

        if (!validation.valid) {
            throw new BadRequestException({
                message: 'Invalid export file',
                errors: validation.errors,
                warnings: validation.warnings,
            });
        }

        // Verificar conflito de slug
        const proposedSlug = this.generateSlugFromTitle(exportData.quiz.title);
        const existingQuiz = await this.prisma.quiz.findUnique({
            where: { slug: proposedSlug },
            select: { id: true, title: true },
        });

        const slugConflict = !!existingQuiz;

        // Verificar limites do plano
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { quizzes: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const warnings = [...validation.warnings];
        if (user.quizzes.length > 0) {
            // Verificar limite (mas não bloquear no preview, apenas avisar)
            try {
                await this.checkQuizLimit(userId);
            } catch (error: any) {
                if (error.code === 'QUIZ_LIMIT_REACHED') {
                    warnings.push(`Atenção: Você atingiu o limite de quizzes do seu plano.`);
                }
            }
        }

        return {
            quiz: {
                title: exportData.quiz.title,
                description: exportData.quiz.description,
                language: exportData.quiz.language || 'en',
                capture_mode: exportData.quiz.capture_mode,
                is_published: exportData.quiz.is_published || false,
                auto_advance: exportData.quiz.auto_advance || false,
            },
            stepsCount: exportData.steps?.length || 0,
            resultPagesCount: exportData.resultPages?.length || 0,
            slugConflict,
            existingSlug: slugConflict ? proposedSlug : undefined,
            warnings,
            errors: validation.errors,
        };
    }

    /**
     * Importa um quiz a partir dos dados exportados
     */
    async importQuiz(
        userId: string,
        file: Express.Multer.File,
        options: ImportOptionsDto,
        isAdmin: boolean = false,
    ) {
        // Verificar limite antes de importar (admin não tem limite)
        if (!isAdmin) {
            await this.checkQuizLimit(userId);
        }

        // Extrair e validar dados
        const exportData = await this.importExportService.extractJsonFromFile(file);
        const validation = this.importExportService.validateExportData(exportData);

        if (!validation.valid) {
            throw new BadRequestException({
                message: 'Invalid export file',
                errors: validation.errors,
                warnings: validation.warnings,
            });
        }

        // Determinar slug
        let finalSlug: string;
        if (options.newSlug) {
            finalSlug = options.newSlug;
            // Verificar se slug customizado já existe
            const existing = await this.prisma.quiz.findUnique({
                where: { slug: finalSlug },
            });
            if (existing) {
                throw new BadRequestException(`Slug "${finalSlug}" already exists`);
            }
        } else if (options.importMode === 'replace' && options.existingQuizId) {
            // Se for replace, usar o quiz existente
            const existingQuiz = await this.findOne(userId, options.existingQuizId);
            finalSlug = existingQuiz.slug;
        } else {
            // Gerar novo slug (com sufixo se necessário)
            finalSlug = await this.generateSlugWithSuffix(exportData.quiz.title);
        }

        // Criar quiz usando transação
        return await this.prisma.$transaction(async (tx) => {
            // Se for replace, deletar quiz existente primeiro
            if (options.importMode === 'replace' && options.existingQuizId) {
                await tx.quiz.delete({
                    where: { id: options.existingQuizId },
                });
            }

            // Criar quiz
            const quiz = await tx.quiz.create({
                data: {
                    title: exportData.quiz.title,
                    description: exportData.quiz.description,
                    language: exportData.quiz.language || 'en',
                    capture_mode: exportData.quiz.capture_mode as any, // Cast para enum
                    is_published: false, // Sempre importar como não publicado
                    auto_advance: exportData.quiz.auto_advance || false,
                    slug: finalSlug,
                    user_id: userId,
                },
            });

            // Processar steps
            const steps = await Promise.all(
                exportData.steps.map(async (stepData, index) => {
                    // Converter imagem base64 para URL se existir
                    let imageUrl = stepData.image_url;
                    if (stepData.image_base64) {
                        const convertedUrl = await this.importExportService.convertBase64ToImage(stepData.image_base64);
                        if (convertedUrl) {
                            imageUrl = convertedUrl;
                        }
                    }

                    const step = await tx.step.create({
                        data: {
                            quiz_id: quiz.id,
                            order: stepData.order !== undefined ? stepData.order : index,
                            type: stepData.type as any, // Cast para enum StepType
                            title: stepData.title,
                            description: stepData.description,
                            image_url: imageUrl,
                            metadata: stepData.metadata || {},
                            question:
                                stepData.type === 'QUESTION' && stepData.question
                                    ? {
                                          create: {
                                              text: stepData.question.text,
                                              options: {
                                                  create: stepData.question.options.map((opt) => ({
                                                      text: opt.text,
                                                      value: opt.value,
                                                  })),
                                              },
                                          },
                                      }
                                    : undefined,
                        },
                        include: {
                            question: {
                                include: {
                                    options: true,
                                },
                            },
                        },
                    });

                    return step;
                }),
            );

            // Processar result pages se existirem
            let resultPages = [];
            if (exportData.resultPages && exportData.resultPages.length > 0) {
                resultPages = await Promise.all(
                    exportData.resultPages.map((rpData) =>
                        (tx as any).resultPage.create({
                            data: {
                                quiz_id: quiz.id,
                                headline_template: rpData.headline_template,
                                body_template: rpData.body_template,
                                cta_text: rpData.cta_text,
                                cta_url: rpData.cta_url,
                            },
                        }),
                    ),
                );
            }

            // Retornar quiz completo
            return {
                ...quiz,
                steps,
                result_pages: resultPages,
            };
        });
    }

    private generateSlugFromTitle(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
