import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetLeadsQueryDto, ExportLeadsQueryDto } from './dto/lead.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class LeadsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string, query: GetLeadsQueryDto) {
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 50;
        const skip = (page - 1) * limit;

        // Buscar todos os quizzes do usuário
        const userQuizzes = await this.prisma.quiz.findMany({
            where: { user_id: userId },
            select: { id: true },
        });

        const quizIds = userQuizzes.map(q => q.id);

        if (quizIds.length === 0) {
            return {
                leads: [],
                total: 0,
                page,
                limit,
            };
        }

        // Construir filtros
        const where: any = {
            quiz_id: { in: quizIds },
        };

        if (query.quizId) {
            // Validar que o quiz pertence ao usuário
            if (!quizIds.includes(query.quizId)) {
                throw new BadRequestException('Quiz not found or access denied');
            }
            where.quiz_id = query.quizId;
        }

        if (query.startDate || query.endDate) {
            where.created_at = {};
            if (query.startDate) {
                where.created_at.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.created_at.lte = new Date(query.endDate);
            }
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [leads, total] = await Promise.all([
            this.prisma.lead.findMany({
                where,
                include: {
                    quiz: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.lead.count({ where }),
        ]);

        return {
            leads: leads.map(lead => ({
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                quiz: lead.quiz,
                created_at: lead.created_at.toISOString(),
            })),
            total,
            page,
            limit,
        };
    }

    async findByQuiz(userId: string) {
        // Buscar todos os quizzes do usuário com seus leads
        const quizzes = await this.prisma.quiz.findMany({
            where: { user_id: userId },
            include: {
                leads: {
                    orderBy: { created_at: 'desc' },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        return {
            quizzes: quizzes.map(quiz => ({
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    slug: quiz.slug,
                },
                leads: quiz.leads.map(lead => ({
                    id: lead.id,
                    name: lead.name,
                    email: lead.email,
                    phone: lead.phone,
                    created_at: lead.created_at.toISOString(),
                })),
                total: quiz.leads.length,
            })),
        };
    }

    async export(userId: string, query: ExportLeadsQueryDto) {
        // Buscar leads com os mesmos filtros
        const getLeadsQuery: GetLeadsQueryDto = {
            quizId: query.quizId,
            startDate: query.startDate,
            endDate: query.endDate,
            limit: 10000, // Limite alto para exportação
        };

        const { leads } = await this.findAll(userId, getLeadsQuery);

        if (query.format === 'csv') {
            return this.exportToCSV(leads);
        } else if (query.format === 'excel') {
            return this.exportToExcel(leads);
        } else {
            throw new BadRequestException('Invalid format. Use csv or excel');
        }
    }

    private exportToCSV(leads: any[]) {
        const headers = ['Quiz', 'Nome', 'E-mail', 'Telefone', 'Data de Captura'];
        const rows = leads.map(lead => [
            lead.quiz.title,
            lead.name || '',
            lead.email,
            lead.phone || '',
            new Date(lead.created_at).toLocaleString('pt-BR'),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        return {
            content: csvContent,
            filename: `leads_${new Date().toISOString().split('T')[0]}.csv`,
            contentType: 'text/csv',
        };
    }

    private exportToExcel(leads: any[]) {
        const data = leads.map(lead => ({
            'Quiz': lead.quiz.title,
            'Nome': lead.name || '',
            'E-mail': lead.email,
            'Telefone': lead.phone || '',
            'Data de Captura': new Date(lead.created_at).toLocaleString('pt-BR'),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return {
            content: excelBuffer,
            filename: `leads_${new Date().toISOString().split('T')[0]}.xlsx`,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
    }
}

