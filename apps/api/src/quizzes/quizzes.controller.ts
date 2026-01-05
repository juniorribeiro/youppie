import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Request() req: any, @Body() createQuizDto: CreateQuizDto) {
        return this.quizzesService.create(req.user.id, createQuizDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@Request() req: any) {
        return this.quizzesService.findAll(req.user.id);
    }

    // Public endpoint
    @Get('public/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.quizzesService.findBySlug(slug);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.quizzesService.findOne(req.user.id, id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Request() req: any, @Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
        return this.quizzesService.update(req.user.id, id, updateQuizDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Request() req: any, @Param('id') id: string) {
        return this.quizzesService.remove(req.user.id, id);
    }
}
