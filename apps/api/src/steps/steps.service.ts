import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { CreateStepDto, UpdateStepDto } from './dto/step.dto';

@Injectable()
export class StepsService {
    constructor(
        private prisma: PrismaService,
        private quizzesService: QuizzesService,
    ) { }

    async findAllByQuiz(userId: string, quizId: string) {
        // Ownership check
        await this.quizzesService.findOne(userId, quizId);

        return this.prisma.step.findMany({
            where: { quiz_id: quizId },
            orderBy: { order: 'asc' },
            include: {
                question: {
                    include: { options: true },
                },
            },
        });
    }

    async findOne(userId: string, id: string) {
        const step = await this.prisma.step.findUnique({
            where: { id },
            include: {
                question: {
                    include: { options: true },
                },
            },
        });
        if (!step) throw new NotFoundException('Step not found');

        // Ownership check via quiz
        await this.quizzesService.findOne(userId, step.quiz_id);

        return step;
    }

    async create(userId: string, quizId: string, createStepDto: CreateStepDto) {
        await this.quizzesService.findOne(userId, quizId); // Ownership check

        const { question, quizId: _, ...stepData } = createStepDto;

        const step = await this.prisma.step.create({
            data: {
                ...stepData,
                metadata: createStepDto.metadata || {},
                quiz_id: quizId,
                question:
                    stepData.type === 'QUESTION'
                        ? {
                            create: {
                                text: question?.text || 'Sua pergunta aqui',
                                options: {
                                    create: question?.options || [
                                        { text: 'Opção 1', value: 'opcao-1' },
                                        { text: 'Opção 2', value: 'opcao-2' },
                                    ],
                                },
                            },
                        }
                        : undefined,
            },
            include: {
                question: {
                    include: { options: true },
                },
            },
        });

        return step;
    }

    async update(userId: string, id: string, updateStepDto: UpdateStepDto) {
        const step = await this.prisma.step.findUnique({
            where: { id },
            include: { question: { include: { options: true } } }
        });
        if (!step) throw new NotFoundException('Step not found');

        // Ownership check via quiz
        await this.quizzesService.findOne(userId, step.quiz_id);

        const { question, ...stepData } = updateStepDto;

        // Update step basic fields
        const updated = await this.prisma.step.update({
            where: { id },
            data: {
                ...stepData,
                ...(updateStepDto.metadata && { metadata: updateStepDto.metadata }), // Update metadata if provided
            },
        });

        // Update question if provided and step is QUESTION type
        if (step.type === 'QUESTION' && question && step.question) {
            // Update question text
            await this.prisma.question.update({
                where: { id: step.question.id },
                data: { text: question.text || step.question.text },
            });

            // Delete all existing options
            await this.prisma.answerOption.deleteMany({
                where: { question_id: step.question.id },
            });

            // Create new options
            if (question.options && question.options.length > 0) {
                await this.prisma.answerOption.createMany({
                    data: question.options.map((opt) => ({
                        question_id: step.question!.id,
                        text: opt.text,
                        value: opt.value,
                    })),
                });
            }
        }

        // Return updated step with relations
        return this.prisma.step.findUnique({
            where: { id },
            include: {
                question: {
                    include: { options: true },
                },
            },
        });
    }

    async remove(userId: string, id: string) {
        const step = await this.prisma.step.findUnique({ where: { id } });
        if (!step) throw new NotFoundException('Step not found');

        await this.quizzesService.findOne(userId, step.quiz_id);

        return this.prisma.step.delete({ where: { id } });
    }

    async reorder(userId: string, quizId: string, orderedIds: string[]) {
        await this.quizzesService.findOne(userId, quizId);

        const updates = orderedIds.map((id, index) =>
            this.prisma.step.update({
                where: { id },
                data: { order: index },
            }),
        );

        return this.prisma.$transaction(updates);
    }
}
