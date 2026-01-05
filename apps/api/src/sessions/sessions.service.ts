import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartSessionDto, SubmitAnswerDto } from './dto/session.dto';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) { }

    async startSession(dto: StartSessionDto) {
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
                    quiz_id: dto.quizId, // Added quiz_id
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

        // Update answers JSON
        // Note: Prisma JSON updates can be fetching, merging, saving
        // For simplicity, we assume we fetch, merge in app, and save.
        // In real app, consider using JSON capabilities of the DB if possible or careful merging.

        // cast to any to manipulate json object
        const currentAnswers = (session.answers as any) || {};
        currentAnswers[dto.stepId] = dto.value;

        return this.prisma.session.update({
            where: { id: sessionId },
            data: {
                answers: currentAnswers,
            },
        });
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
}
