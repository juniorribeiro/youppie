import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ToursService } from './tours.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompleteTourDto } from './dto/tour.dto';

@Controller('tours')
@UseGuards(JwtAuthGuard)
export class ToursController {
    constructor(private readonly toursService: ToursService) {}

    @Get(':tourId/status')
    async getTourStatus(@Param('tourId') tourId: string, @Request() req: any) {
        const completed = await this.toursService.checkTourStatus(req.user.id, tourId);
        return { completed };
    }

    @Post('complete')
    async completeTour(@Body() completeTourDto: CompleteTourDto, @Request() req: any) {
        await this.toursService.completeTour(req.user.id, completeTourDto.tour_id);
        return { success: true };
    }
}

