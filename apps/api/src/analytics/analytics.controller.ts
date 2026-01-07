import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
    QuizzesAnalyticsResponseDto,
    QuizDetailAnalyticsResponseDto,
} from './dto/analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('quizzes')
    async getQuizzesAnalytics(@Request() req: any): Promise<QuizzesAnalyticsResponseDto> {
        return this.analyticsService.getQuizzesAnalytics(req.user.id);
    }

    @Get('quizzes/:quizId')
    async getQuizAnalytics(
        @Param('quizId') quizId: string,
        @Request() req: any,
    ): Promise<QuizDetailAnalyticsResponseDto> {
        return this.analyticsService.getQuizAnalytics(quizId, req.user.id);
    }
}

