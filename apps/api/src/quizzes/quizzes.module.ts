import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
    imports: [SubscriptionsModule],
    controllers: [QuizzesController],
    providers: [QuizzesService],
    exports: [QuizzesService],
})
export class QuizzesModule { }
