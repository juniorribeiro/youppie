import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionIntentDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Get('plans')
    async getPlans() {
        try {
            return await this.subscriptionsService.getPlans();
        } catch (error) {
            console.error('Error in getPlans:', error);
            throw error;
        }
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMySubscription(@Request() req: any) {
        return this.subscriptionsService.getUserSubscription(req.user.id);
    }

    @Post('create-intent')
    @UseGuards(JwtAuthGuard)
    createSubscriptionIntent(@Request() req: any, @Body() dto: CreateSubscriptionIntentDto) {
        return this.subscriptionsService.createSubscriptionIntent(req.user.id, dto.plan);
    }

    @Post('cancel')
    @UseGuards(JwtAuthGuard)
    cancelSubscription(@Request() req: any) {
        return this.subscriptionsService.cancelSubscription(req.user.id);
    }

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    async verifySubscription(@Request() req: any) {
        return this.subscriptionsService.verifyAndUpdateSubscription(req.user.id);
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getSubscriptionHistory(@Request() req: any) {
        return this.subscriptionsService.getSubscriptionHistory(req.user.id);
    }
}

