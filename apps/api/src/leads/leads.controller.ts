import { Controller, Get, Query, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetLeadsQueryDto, ExportLeadsQueryDto } from './dto/lead.dto';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Get()
    async findAll(@Request() req: any, @Query() query: GetLeadsQueryDto) {
        return this.leadsService.findAll(req.user.id, query);
    }

    @Get('by-quiz')
    async findByQuiz(@Request() req: any) {
        return this.leadsService.findByQuiz(req.user.id);
    }

    @Get('export')
    async export(
        @Request() req: any,
        @Query() query: ExportLeadsQueryDto,
        @Res() res: Response,
    ) {
        const result = await this.leadsService.export(req.user.id, query);

        res.setHeader('Content-Type', result.contentType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${result.filename}"`,
        );

        if (Buffer.isBuffer(result.content)) {
            res.send(result.content);
        } else {
            res.send(result.content);
        }
    }
}

