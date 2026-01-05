import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';

@Injectable()
export class QuizzesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createQuizDto: CreateQuizDto) {
        const slug = this.generateSlug(createQuizDto.title);
        return this.prisma.quiz.create({
            data: {
                ...createQuizDto,
                slug,
                user_id: userId,
            },
        });
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

        return this.prisma.quiz.update({
            where: { id },
            data: {
                ...data,
                ...(is_published !== undefined && { is_published }),
                ...(auto_advance !== undefined && { auto_advance }),
            },
        });
    }

    async remove(userId: string, id: string) {
        await this.findOne(userId, id); // check ownership
        return this.prisma.quiz.delete({
            where: { id },
        });
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7);
    }
}
