import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { StartSessionDto, SubmitAnswerDto, CreateSessionLeadDto } from './dto/session.dto';

@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post()
    startSession(@Body() dto: StartSessionDto) {
        return this.sessionsService.startSession(dto);
    }

    @Post(':id/answers')
    submitAnswer(@Param('id') id: string, @Body() dto: SubmitAnswerDto) {
        return this.sessionsService.submitAnswer(id, dto);
    }

    @Post(':id/complete')
    completeSession(@Param('id') id: string) {
        return this.sessionsService.completeSession(id);
    }

    @Get(':id')
    getSession(@Param('id') id: string) {
        return this.sessionsService.getSession(id);
    }

    @Post(':id/lead')
    createOrUpdateLead(@Param('id') id: string, @Body() dto: CreateSessionLeadDto) {
        return this.sessionsService.createOrUpdateLead(id, dto);
    }

    @Get(':id/next-step')
    getNextStep(@Param('id') id: string, @Query('currentStepId') currentStepId: string) {
        return this.sessionsService.getNextStep(id, currentStepId);
    }
}
