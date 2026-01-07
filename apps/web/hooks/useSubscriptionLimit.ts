"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface SubscriptionLimit {
    current: number;
    limit: number;
    percentage: number;
    isNearLimit: boolean;
    isAtLimit: boolean;
    plan: string;
}

export function useSubscriptionLimit() {
    const [limit, setLimit] = useState<SubscriptionLimit>({
        current: 0,
        limit: 1,
        percentage: 0,
        isNearLimit: false,
        isAtLimit: false,
        plan: "FREE",
    });
    const [loading, setLoading] = useState(true);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchLimit = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Buscar subscription atual
                const subscription = await apiFetch<{ plan: string; status: string }>("/subscriptions/me", {
                    token,
                });

                // Buscar número de quizzes
                const quizzes = await apiFetch<Array<{ id: string }>>("/quizzes", {
                    token,
                });

                // Buscar limites do plano
                const plans = await apiFetch<Array<{ id: string; quizLimit: number }>>("/subscriptions/plans", {
                    token,
                });

                const planInfo = plans.find((p) => p.id === subscription.plan) || plans[0];
                const current = quizzes.length;
                const limitValue = planInfo.quizLimit;
                const percentage = (current / limitValue) * 100;
                const isNearLimit = percentage >= 80;
                const isAtLimit = current >= limitValue;

                setLimit({
                    current,
                    limit: limitValue,
                    percentage,
                    isNearLimit,
                    isAtLimit,
                    plan: subscription.plan,
                });
            } catch (error) {
                console.error("Erro ao buscar limite de subscription:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLimit();
    }, [token, user?.subscription_plan]);

    return { ...limit, loading };
}

