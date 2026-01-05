import { Module } from '@nestjs/common';
import { StepsService } from './steps.service';
import { StepsController } from './steps.controller';
import { QuizzesModule } from '../quizzes/quizzes.module';

@Module({
    imports: [QuizzesModule],
    controllers: [StepsController],
    providers: [StepsService],
})
export class StepsModule { }
