import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartSessionDto, SubmitAnswerDto, CreateSessionLeadDto } from './dto/session.dto';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) { }

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
}
