import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan, PlanInfo } from './dto/subscription.dto';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
    private stripe: Stripe | null = null;

    constructor(private prisma: PrismaService) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (stripeKey) {
            this.stripe = new Stripe(stripeKey, {
                apiVersion: '2025-02-24.acacia',
            });
        }
    }

    async getPlans(): Promise<PlanInfo[]> {
        const plans: PlanInfo[] = [
            {
                id: SubscriptionPlan.FREE,
                name: 'Youppie Free',
                quizLimit: 1,
            },
            {
                id: SubscriptionPlan.BASIC,
                name: 'Youppie Basic',
                quizLimit: 15,
                priceId: process.env.STRIPE_PRICE_ID_BASIC,
            },
            {
                id: SubscriptionPlan.PRO,
                name: 'Youppie Pro',
                quizLimit: 30,
                priceId: process.env.STRIPE_PRICE_ID_PRO,
            },
            {
                id: SubscriptionPlan.ENTERPRISE,
                name: 'Youppie Enterprise',
                quizLimit: 60,
                priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
            },
            {
                id: SubscriptionPlan.UNLIMITED,
                name: 'Youppie Ilimitado',
                quizLimit: null, // Ilimitado - não tem priceId, só via overrides
            },
        ];

        // Buscar preços do Stripe se estiver configurado
        if (this.stripe) {
            for (const plan of plans) {
                if (plan.priceId) {
                    try {
                        const price = await this.stripe.prices.retrieve(plan.priceId);
                        // Adicionar informações de preço ao plano
                        (plan as any).amount = price.unit_amount ? price.unit_amount / 100 : 0;
                        (plan as any).currency = price.currency || 'brl';
                        (plan as any).interval = price.recurring?.interval || 'month';
                    } catch (error: any) {
                        console.error(`Erro ao buscar preço do Stripe para ${plan.id}:`, error);
                    }
                }
            }
        }

        return plans;
    }

    async getPlanLimits(plan: SubscriptionPlan): Promise<number | null> {
        const plans = await this.getPlans();
        const planInfo = plans.find((p) => p.id === plan);
        // Se quizLimit for null, significa ilimitado
        // Retornamos null para indicar ilimitado, caso contrário retorna o limite ou 1 como padrão
        if (planInfo?.quizLimit === null) {
            return null; // Ilimitado
        }
        return planInfo?.quizLimit ?? 1;
    }

    async getUserSubscription(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscription_plan: true,
                stripe_customer_id: true,
                stripe_subscription_id: true,
                subscription_status: true,
                subscription_current_period_end: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            plan: user.subscription_plan,
            status: user.subscription_status,
            currentPeriodEnd: user.subscription_current_period_end,
            stripeCustomerId: user.stripe_customer_id,
            stripeSubscriptionId: user.stripe_subscription_id,
        };
    }

    async createSubscriptionIntent(userId: string, plan: SubscriptionPlan) {
        if (!this.stripe) {
            throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
        }

        if (plan === SubscriptionPlan.FREE) {
            throw new BadRequestException('Cannot create subscription for FREE plan');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const plans = await this.getPlans();
        const planInfo = plans.find((p) => p.id === plan);
        if (!planInfo || !planInfo.priceId) {
            throw new BadRequestException(`Price ID not configured for plan ${plan}`);
        }

        // Criar ou obter customer no Stripe
        let customerId = user.stripe_customer_id;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id,
                },
            });
            customerId = customer.id;

            await this.prisma.user.update({
                where: { id: userId },
                data: { stripe_customer_id: customerId },
            });
        }

        // Se já tem uma subscription ativa, cancelar a antiga antes de criar nova
        if (user.stripe_subscription_id) {
            try {
                const existingSubscription = await this.stripe.subscriptions.retrieve(user.stripe_subscription_id);
                if (existingSubscription.status === 'active' || existingSubscription.status === 'trialing') {
                    // Cancelar a subscription antiga imediatamente
                    await this.stripe.subscriptions.cancel(user.stripe_subscription_id);
                }
            } catch (error) {
                // Ignorar erro se a subscription não existir mais
                console.error('Erro ao cancelar subscription antiga:', error);
            }
        }

        // Criar subscription no Stripe
        const subscription = await this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: planInfo.priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                userId: user.id,
                plan: plan,
            },
        });

        // Atualizar o subscription_id no banco imediatamente para que a verificação funcione
        await this.prisma.user.update({
            where: { id: userId },
            data: { stripe_subscription_id: subscription.id },
        });

        const invoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

        if (!paymentIntent || typeof paymentIntent === 'string') {
            throw new BadRequestException('Failed to create payment intent');
        }

        return {
            clientSecret: paymentIntent.client_secret,
            subscriptionId: subscription.id,
        };
    }

    async cancelSubscription(userId: string) {
        if (!this.stripe) {
            throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.stripe_subscription_id) {
            throw new NotFoundException('No active subscription found');
        }

        // Cancelar no Stripe (mantém acesso até o fim do período)
        await this.stripe.subscriptions.update(user.stripe_subscription_id, {
            cancel_at_period_end: true,
        });

        return { message: 'Subscription will be canceled at the end of the current period' };
    }

    async verifyAndUpdateSubscription(userId: string) {
        if (!this.stripe) {
            throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return { updated: false, message: 'User not found' };
        }

        if (!user.stripe_subscription_id) {
            // Se não tem subscription_id mas tem customer_id, buscar subscriptions do customer
            if (user.stripe_customer_id) {
                try {
                    const subscriptions = await this.stripe.subscriptions.list({
                        customer: user.stripe_customer_id,
                        status: 'all',
                        limit: 1,
                    });
                    
                    if (subscriptions.data.length > 0) {
                        const subscription = subscriptions.data[0];
                        
                        if (subscription.status === 'active' || subscription.status === 'trialing') {
                            await this.updateSubscriptionFromStripe(subscription);
                            return { updated: true, message: 'Subscription found and updated' };
                        }
                    }
                } catch (error: any) {
                    // Ignorar erro
                }
            }
            
            return { updated: false, message: 'No subscription found' };
        }

        try {
            // Buscar subscription atual do Stripe
            const subscription = await this.stripe.subscriptions.retrieve(user.stripe_subscription_id);

            // Sempre atualizar se a subscription está ativa no Stripe
            if (subscription.status === 'active' || subscription.status === 'trialing') {
                await this.updateSubscriptionFromStripe(subscription);
                return { updated: true, message: 'Subscription updated' };
            }

            return { updated: false, message: `Subscription status: ${subscription.status}` };
        } catch (error: any) {
            console.error('Erro ao verificar subscription:', error);
            throw new BadRequestException('Failed to verify subscription');
        }
    }

    async handleWebhookEvent(event: Stripe.Event) {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await this.updateSubscriptionFromStripe(subscription);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await this.handleSubscriptionDeleted(subscription);
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                
                // Quando uma invoice é paga, atualizar a subscription também
                if (invoice.subscription && typeof invoice.subscription === 'object') {
                    await this.updateSubscriptionFromStripe(invoice.subscription as Stripe.Subscription);
                } else if (invoice.subscription && typeof invoice.subscription === 'string' && this.stripe) {
                    // Buscar a subscription se for apenas um ID
                    const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
                    await this.updateSubscriptionFromStripe(subscription);
                }
                
                await this.handleInvoicePaid(invoice);
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await this.handleInvoicePaymentFailed(invoice);
                break;
            }
        }
    }

    private async updateSubscriptionFromStripe(subscription: Stripe.Subscription) {
        const userId = subscription.metadata?.userId;
        if (!userId) {
            return;
        }

        const plan = subscription.metadata?.plan as SubscriptionPlan;
        if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
            return;
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                stripe_subscription_id: subscription.id,
                subscription_plan: plan,
                subscription_status: subscription.status,
                subscription_current_period_end: new Date(subscription.current_period_end * 1000),
            },
        });
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        const userId = subscription.metadata?.userId;
        if (!userId) return;

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                subscription_plan: SubscriptionPlan.FREE,
                subscription_status: 'canceled',
                stripe_subscription_id: null,
                subscription_current_period_end: null,
            },
        });
    }

    private async handleInvoicePaid(invoice: Stripe.Invoice) {
        // Manter acesso até o fim do período - já atualizado pelo subscription.updated
        // Pode adicionar lógica adicional aqui se necessário
    }

    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
        // Notificar usuário - pode implementar notificação aqui
        // O status da subscription será atualizado para 'past_due' pelo subscription.updated
    }

    async getSubscriptionHistory(userId: string) {
        if (!this.stripe) {
            throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.stripe_customer_id) {
            return {
                currentSubscription: null,
                invoices: [],
            };
        }

        try {
            // Buscar subscription atual
            let currentSubscription = null;
            if (user.stripe_subscription_id) {
                try {
                    const subscription = await this.stripe.subscriptions.retrieve(user.stripe_subscription_id);
                    currentSubscription = {
                        id: subscription.id,
                        status: subscription.status,
                        plan: subscription.metadata?.plan || user.subscription_plan,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    };
                } catch (error) {
                    // Subscription pode não existir mais
                    console.error('Erro ao buscar subscription:', error);
                }
            }

            // Buscar invoices
            const invoices = await this.stripe.invoices.list({
                customer: user.stripe_customer_id,
                limit: 50,
            });

            const invoiceHistory = invoices.data.map((invoice) => ({
                id: invoice.id,
                amount: invoice.amount_paid ? invoice.amount_paid / 100 : 0,
                currency: invoice.currency?.toUpperCase() || 'BRL',
                status: invoice.status,
                paid: invoice.paid,
                date: new Date(invoice.created * 1000),
                periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
                description: invoice.description || invoice.lines?.data[0]?.description || 'Assinatura',
            }));

            return {
                currentSubscription,
                invoices: invoiceHistory.sort((a, b) => b.date.getTime() - a.date.getTime()),
            };
        } catch (error: any) {
            console.error('Erro ao buscar histórico:', error);
            throw new BadRequestException('Failed to retrieve subscription history');
        }
    }
}

