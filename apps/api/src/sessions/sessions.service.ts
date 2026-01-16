import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartSessionDto, SubmitAnswerDto, CreateSessionLeadDto, NextStepResponseDto } from './dto/session.dto';
import { RulesService, EvaluationContext } from '../rules/rules.service';
import { RuleDto } from '../steps/dto/step.dto';

@Injectable()
export class SessionsService {
    constructor(
        private prisma: PrismaService,
        private rulesService: RulesService,
    ) { }

    async startSession(dto: StartSessionDto) {
        if (!dto.quizId) {
            throw new NotFoundException('Quiz ID is required');
        }
        
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: dto.quizId },
        });
        if (!quiz) throw new NotFoundException('Quiz not found');

        let leadId = null;
        if (dto.lead) {
            const lead = await this.prisma.lead.create({
                data: {
                    email: dto.lead.email,
                    name: dto.lead.name,
                    phone: dto.lead.phone,
                    quiz_id: dto.quizId,
                },
            });
            leadId = lead.id;
        }

        return this.prisma.session.create({
            data: {
                quiz_id: dto.quizId, // Updated from quizId
                lead_id: leadId,    // Updated from leadId
            },
        });
    }

    async submitAnswer(sessionId: string, dto: SubmitAnswerDto) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) throw new NotFoundException('Session not found');

        // Buscar o step atual
        const step = await this.prisma.step.findUnique({
            where: { id: dto.stepId },
        });
        if (!step) throw new NotFoundException('Step not found');

        // If value is an array (multiple choice), validate limits
        if (Array.isArray(dto.value)) {
            if (step.metadata) {
                const metadata = step.metadata as any;
                if (metadata.multipleChoice === true) {
                    const selectedCount = dto.value.length;
                    const minSelections = metadata.minSelections ?? 1;
                    const maxSelections = metadata.maxSelections;

                    if (selectedCount < minSelections) {
                        throw new BadRequestException(
                            `Selecione pelo menos ${minSelections} opção${minSelections > 1 ? 'ões' : ''}`
                        );
                    }

                    if (maxSelections !== null && maxSelections !== undefined && selectedCount > maxSelections) {
                        throw new BadRequestException(
                            `Selecione no máximo ${maxSelections} opção${maxSelections > 1 ? 'ões' : ''}`
                        );
                    }
                }
            }
        }

        // Validar step CAPTURE - todos os campos configurados são obrigatórios
        if (step.type === 'CAPTURE' && step.metadata) {
            const metadata = step.metadata as any;
            const captureFields = metadata.captureFields || { name: true, email: true, phone: false };
            const value = dto.value as any;
            
            const errors: string[] = [];
            
            // Validar nome se configurado
            if (captureFields.name !== false) {
                if (!value?.name || typeof value.name !== 'string' || !value.name.trim()) {
                    errors.push('O campo Nome é obrigatório');
                }
            }
            
            // Validar email se configurado
            if (captureFields.email !== false) {
                if (!value?.email || typeof value.email !== 'string' || !value.email.trim()) {
                    errors.push('O campo Email é obrigatório');
                } else {
                    // Validar formato de email
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value.email.trim())) {
                        errors.push('Por favor, insira um email válido');
                    }
                }
            }
            
            // Validar telefone se configurado
            if (captureFields.phone === true) {
                if (!value?.phone || typeof value.phone !== 'string' || !value.phone.trim()) {
                    errors.push('O campo Telefone é obrigatório');
                }
            }
            
            if (errors.length > 0) {
                throw new BadRequestException(errors.join('; '));
            }
        }

        // Update answers JSON
        const currentAnswers = (session.answers as any) || {};
        currentAnswers[dto.stepId] = dto.value;

        // Se for step INPUT, extrair variável do metadata
        if (step.type === 'INPUT' && step.metadata) {
            const metadata = step.metadata as any;
            if (metadata.variableName) {
                // Variáveis serão armazenadas no formato __variables__ no answers
                if (!currentAnswers.__variables__) {
                    currentAnswers.__variables__ = {};
                }
                currentAnswers.__variables__[metadata.variableName] = dto.value;
            }
        }

        // Salvar resposta
        const updatedSession = await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                answers: currentAnswers,
            },
        });

        return updatedSession;
    }

    async completeSession(sessionId: string) {
        return this.prisma.session.update({
            where: { id: sessionId },
            data: { completed_at: new Date() } // Updated from completed
        });
    }

    async getSession(sessionId: string) {
        return this.prisma.session.findUnique({
            where: { id: sessionId },
        });
    }

    async createOrUpdateLead(sessionId: string, dto: CreateSessionLeadDto) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { quiz: true },
        });
        if (!session) throw new NotFoundException('Session not found');

        // Normalize email: convert empty string to undefined
        const email = dto.email && dto.email.trim() !== '' ? dto.email.trim() : undefined;
        const name = dto.name && dto.name.trim() !== '' ? dto.name.trim() : undefined;
        const phone = dto.phone && dto.phone.trim() !== '' ? dto.phone.trim() : undefined;

        // Email is required in the schema, so we need to provide a placeholder if not provided
        // But we should validate that at least one field is provided
        if (!email && !name && !phone) {
            throw new BadRequestException('At least one field (email, name, or phone) must be provided');
        }

        // Use a placeholder email if none provided (email is required in schema)
        const finalEmail = email || `lead-${sessionId}@placeholder.local`;

        // Se já existe lead na sessão, atualizar
        if (session.lead_id) {
            const lead = await this.prisma.lead.update({
                where: { id: session.lead_id },
                data: {
                    email: finalEmail,
                    name: name || undefined,
                    phone: phone || undefined,
                },
            });
            return lead;
        }

        // Se não existe lead, criar novo e associar à sessão
        const lead = await this.prisma.lead.create({
            data: {
                email: finalEmail,
                name: name || undefined,
                phone: phone || undefined,
                quiz_id: session.quiz_id,
            },
        });

        // Atualizar sessão com o lead_id
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { lead_id: lead.id },
        });

        return lead;
    }

    /**
     * Extrai variáveis do objeto answers da sessão
     */
    private extractVariables(answers: any, steps?: any[]): Record<string, any> {
        const variables: Record<string, any> = {};
        
        // Variáveis de INPUT steps
        if (answers && answers.__variables__) {
            Object.assign(variables, answers.__variables__);
        }
        
        // Variáveis de CAPTURE steps (name, email, phone)
        if (steps && answers) {
            steps.forEach(step => {
                if (step.type === 'CAPTURE' && answers[step.id]) {
                    const captureData = answers[step.id] as any;
                    if (captureData.name) variables.name = captureData.name;
                    if (captureData.email) variables.email = captureData.email;
                    if (captureData.phone) variables.phone = captureData.phone;
                }
            });
        }

        return variables;
    }

    /**
     * Atualiza pontuação da sessão
     */
    async updateScore(sessionId: string, delta: number) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) throw new NotFoundException('Session not found');

        return this.prisma.session.update({
            where: { id: sessionId },
            data: {
                score: session.score + delta,
            },
        });
    }

    /**
     * Define uma variável na sessão
     */
    async setVariable(sessionId: string, variableName: string, value: any) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) throw new NotFoundException('Session not found');

        const currentAnswers = (session.answers as any) || {};
        if (!currentAnswers.__variables__) {
            currentAnswers.__variables__ = {};
        }
        currentAnswers.__variables__[variableName] = value;

        return this.prisma.session.update({
            where: { id: sessionId },
            data: {
                answers: currentAnswers,
            },
        });
    }

    /**
     * Determina o próximo step baseado em regras condicionais
     */
    async getNextStep(sessionId: string, currentStepId: string): Promise<NextStepResponseDto | null> {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                quiz: {
                    include: {
                        steps: {
                            orderBy: { order: 'asc' },
                            include: {
                                question: {
                                    include: { options: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!session) throw new NotFoundException('Session not found');

        const currentStep = session.quiz.steps.find(s => s.id === currentStepId);
        if (!currentStep) throw new NotFoundException('Current step not found');

        const answers = (session.answers as any) || {};
        const variables = this.extractVariables(answers, session.quiz.steps);

        // Se o step atual tem regras, avaliar
        if (currentStep.metadata) {
            const metadata = currentStep.metadata as any;
            if (metadata.rules && Array.isArray(metadata.rules) && metadata.rules.length > 0) {
                const context: EvaluationContext = {
                    answers,
                    variables,
                    currentStepId,
                };

                const evaluationResult = this.rulesService.evaluateRules(metadata.rules as RuleDto[], context);

                if (evaluationResult.matched && evaluationResult.actions.length > 0) {
                    // Executar ações
                    let nextStepId: string | null = null;
                    let scoreDelta = 0;
                    let message: string | undefined;
                    let redirect: string | undefined;

                    // Verificar se há ações de prioridade alta primeiro (end, redirect)
                    const hasEnd = evaluationResult.actions.some(a => a.type === 'end');
                    const hasRedirect = evaluationResult.actions.find(a => a.type === 'redirect');

                    // Se há redirect, encerrar imediatamente
                    if (hasRedirect && hasRedirect.value && typeof hasRedirect.value === 'string') {
                        return {
                            stepId: '',
                            redirect: hasRedirect.value,
                            actions: evaluationResult.actions,
                        };
                    }

                    // Se há end, encerrar imediatamente
                    if (hasEnd) {
                        return null; // Quiz termina
                    }

                    // Processar outras ações
                    for (const action of evaluationResult.actions) {
                        switch (action.type) {
                            case 'goto':
                                if (action.target) {
                                    // Validar se stepId existe
                                    const targetStep = session.quiz.steps.find(s => s.id === action.target);
                                    if (targetStep) {
                                        nextStepId = action.target;
                                    } else {
                                        console.warn(`Step ID ${action.target} not found in quiz. Using fallback.`);
                                    }
                                }
                                break;
                            case 'skip':
                                // Pular steps: value pode ser número ou stepId
                                if (typeof action.value === 'number') {
                                    // Pular N steps
                                    const skipCount = action.value;
                                    const currentIndex = session.quiz.steps.findIndex(s => s.id === currentStepId);
                                    const targetIndex = currentIndex + skipCount;
                                    if (targetIndex >= 0 && targetIndex < session.quiz.steps.length) {
                                        nextStepId = session.quiz.steps[targetIndex].id;
                                    }
                                } else if (typeof action.value === 'string') {
                                    // Pular para stepId específico
                                    const targetStep = session.quiz.steps.find(s => s.id === action.value);
                                    if (targetStep) {
                                        nextStepId = targetStep.id;
                                    }
                                }
                                break;
                            case 'score':
                                if (typeof action.value === 'number') {
                                    scoreDelta += action.value;
                                }
                                break;
                            case 'setVariable':
                                if (action.target && action.value !== undefined) {
                                    await this.setVariable(sessionId, action.target, action.value);
                                }
                                break;
                            case 'message':
                                // Mensagem será retornada na resposta para exibir no frontend
                                if (action.value && typeof action.value === 'string') {
                                    message = action.value;
                                }
                                break;
                            case 'redirect':
                                // Já tratado acima, mas mantido para clareza
                                if (action.value && typeof action.value === 'string') {
                                    redirect = action.value;
                                }
                                break;
                            case 'end':
                                // Já tratado acima
                                break;
                        }
                    }

                    // Atualizar score se necessário
                    if (scoreDelta !== 0) {
                        await this.updateScore(sessionId, scoreDelta);
                        const updatedSession = await this.getSession(sessionId);
                        const finalStepId = nextStepId || this.getNextStepInOrder(session.quiz.steps, currentStepId)?.id || '';
                        const finalStep = session.quiz.steps.find(s => s.id === finalStepId);
                        const stepIndex = finalStep ? session.quiz.steps.indexOf(finalStep) : undefined;
                        
                        return {
                            stepId: finalStepId,
                            stepIndex,
                            score: (updatedSession as any).score,
                            message,
                            redirect,
                            actions: evaluationResult.actions,
                        };
                    }

                    if (nextStepId) {
                        const nextStep = session.quiz.steps.find(s => s.id === nextStepId);
                        if (nextStep) {
                            const stepIndex = session.quiz.steps.indexOf(nextStep);
                            return {
                                stepId: nextStepId,
                                stepIndex,
                                score: session.score,
                                message,
                                redirect,
                                actions: evaluationResult.actions,
                            };
                        }
                    }

                    // Se não há nextStepId mas há message, retornar com próximo step em ordem
                    if (message) {
                        const nextStep = this.getNextStepInOrder(session.quiz.steps, currentStepId);
                        if (nextStep) {
                            const stepIndex = session.quiz.steps.indexOf(nextStep);
                            return {
                                stepId: nextStep.id,
                                stepIndex,
                                score: session.score,
                                message,
                                actions: evaluationResult.actions,
                            };
                        }
                    }
                }
            }
        }

        // Fallback: próximo step em ordem
        const nextStep = this.getNextStepInOrder(session.quiz.steps, currentStepId);
        if (nextStep) {
            const stepIndex = session.quiz.steps.indexOf(nextStep);
            return {
                stepId: nextStep.id,
                stepIndex,
                score: session.score,
            };
        }

        return null; // Não há próximo step
    }

    /**
     * Retorna o próximo step em ordem sequencial
     */
    private getNextStepInOrder(steps: any[], currentStepId: string): any | null {
        const currentIndex = steps.findIndex(s => s.id === currentStepId);
        if (currentIndex === -1 || currentIndex === steps.length - 1) {
            return null;
        }
        return steps[currentIndex + 1];
    }
}
