import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { StepsService } from './steps.service';
import { CreateStepDto, UpdateStepDto } from './dto/step.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('steps')
@UseGuards(JwtAuthGuard)
export class StepsController {
    constructor(private readonly stepsService: StepsService) { }

    // GET /steps?quizId=xxx
    @Get()
    findAll(@Request() req: any, @Query('quizId') quizId: string) {
        return this.stepsService.findAllByQuiz(req.user.id, quizId);
    }

    // GET /steps/:id
    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.stepsService.findOne(req.user.id, id);
    }

    // POST /steps (body contains quizId)
    @Post()
    create(@Request() req: any, @Body() createStepDto: CreateStepDto) {
        return this.stepsService.create(req.user.id, createStepDto.quizId, createStepDto);
    }

    // PUT /steps/:id
    @Put(':id')
    update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateStepDto: UpdateStepDto,
    ) {
        return this.stepsService.update(req.user.id, id, updateStepDto);
    }

    // PATCH /steps/:id (alias for update)
    @Patch(':id')
    patch(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateStepDto: UpdateStepDto,
    ) {
        return this.stepsService.update(req.user.id, id, updateStepDto);
    }

    // DELETE /steps/:id
    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.stepsService.remove(req.user.id, id);
    }

    // POST /steps/reorder/:quizId
    @Post('reorder/:quizId')
    reorder(
        @Request() req: any,
        @Param('quizId') quizId: string,
        @Body() body: { orderedIds: string[] },
    ) {
        return this.stepsService.reorder(req.user.id, quizId, body.orderedIds);
    }
}
