import { Controller, Post, Body, Headers, RawBodyRequest, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import Stripe from 'stripe';

@Controller('webhooks')
export class SubscriptionsWebhookController {
    private stripe: Stripe | null = null;

    constructor(private readonly subscriptionsService: SubscriptionsService) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (stripeKey) {
            this.stripe = new Stripe(stripeKey, {
                apiVersion: '2025-02-24.acacia',
            });
        }
    }

    @Post('stripe')
    @HttpCode(HttpStatus.OK)
    async handleStripeWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set');
        }

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                req.rawBody as Buffer,
                signature,
                webhookSecret,
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            throw new Error('Webhook signature verification failed');
        }

        await this.subscriptionsService.handleWebhookEvent(event);

        return { received: true };
    }
}

