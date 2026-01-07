export enum SubscriptionPlan {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE',
}

export interface PlanInfo {
    id: SubscriptionPlan;
    name: string;
    quizLimit: number;
    priceId?: string; // Stripe Price ID
    amount?: number; // Preço em centavos (será convertido para reais)
    currency?: string; // Moeda (ex: 'brl')
    interval?: string; // Intervalo de cobrança (ex: 'month', 'year')
}

import { IsEnum } from 'class-validator';

export class CreateSubscriptionIntentDto {
    @IsEnum(SubscriptionPlan)
    plan: SubscriptionPlan;
}

