import { Controller, Get, Post, UseGuards, Request, UseInterceptors, UploadedFile, Res, Param, Body, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';
import { QuizzesService } from '../quizzes/quizzes.service';
import { QuizImportExportService } from '../quizzes/quiz-import-export.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImportOptionsDto } from '../quizzes/dto/quiz-import.dto';

@Controller('admin/quizzes')
@UseGuards(AdminAuthGuard)
export class AdminQuizzesController {
    constructor(
        private quizzesService: QuizzesService,
        private importExportService: QuizImportExportService,
    ) {}

    @Get(':id/export')
    async exportQuiz(@Param('id') id: string, @Request() req: any, @Res() res: Response) {
        // Admin pode exportar qualquer quiz, então não precisa verificar ownership
        // Mas ainda precisa do userId para metadados de exportação
        const exportData = await this.quizzesService.exportQuiz(req.user.id, id, true);
        const zipBuffer = await this.importExportService.createZipFromExportData(exportData);
        
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="quiz-export-${id}-${Date.now()}.zip"`);
        res.send(zipBuffer);
    }

    @Post('import/preview')
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
        // Admin pode importar para qualquer usuário se necessário
        // Por enquanto, importa para o próprio admin (req.user.id é o admin)
        // isAdmin=true para pular verificação de limites
        return this.quizzesService.importQuiz(req.user.id, file, options, true);
    }
}
