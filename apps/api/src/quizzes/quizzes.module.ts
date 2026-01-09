import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { QuizImportExportService } from './quiz-import-export.service';

@Module({
    imports: [SubscriptionsModule],
    controllers: [QuizzesController],
    providers: [QuizzesService, QuizImportExportService],
    exports: [QuizzesService, QuizImportExportService],
})
export class QuizzesModule { }
