import { Module } from '@nestjs/common';
import { AdminQuizzesController } from './admin-quizzes.controller';
import { QuizzesModule } from '../quizzes/quizzes.module';

@Module({
    imports: [QuizzesModule],
    controllers: [AdminQuizzesController],
})
export class AdminQuizzesModule {}
