import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Res, Header, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImportOptionsDto } from './dto/quiz-import.dto';
import { QuizImportExportService } from './quiz-import-export.service';

@Controller('quizzes')
export class QuizzesController {
    constructor(
        private readonly quizzesService: QuizzesService,
        private readonly importExportService: QuizImportExportService,
    ) { }

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

    @Get(':id/export')
    @UseGuards(JwtAuthGuard)
    async exportQuiz(@Request() req: any, @Param('id') id: string, @Res() res: Response) {
        const exportData = await this.quizzesService.exportQuiz(req.user.id, id, false);
        const zipBuffer = await this.importExportService.createZipFromExportData(exportData);
        
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="quiz-export-${id}-${Date.now()}.zip"`);
        res.send(zipBuffer);
    }

    @Post('import/preview')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    }))
    async previewImport(
        @Request() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
                    new FileTypeValidator({ fileType: /(json|zip|application\/json|application\/zip|application\/x-zip-compressed)/ }),
                ],
            }),
        ) file: Express.Multer.File,
    ) {
        return this.quizzesService.previewImport(req.user.id, file);
    }

    @Post('import')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    }))
    async importQuiz(
        @Request() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
                    new FileTypeValidator({ fileType: /(json|zip|application\/json|application\/zip|application\/x-zip-compressed)/ }),
                ],
            }),
        ) file: Express.Multer.File,
        @Body() options: ImportOptionsDto,
    ) {
        return this.quizzesService.importQuiz(req.user.id, file, options);
    }
}
