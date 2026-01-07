"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@repo/ui";
import { Check, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import PlansModal from "@/components/Subscription/PlansModal";

interface Plan {
    id: string;
    name: string;
    quizLimit: number;
    priceId?: string;
    amount?: number;
    currency?: string;
    interval?: string;
}

export default function PricingSection() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiFetch<Plan[]>("/subscriptions/plans");
                setPlans(data);
            } catch (error) {
                console.error("Erro ao buscar planos:", error);
            }
        };
        fetchPlans();
    }, []);

    const handleSelectPlan = (planId: string) => {
        if (isAuthenticated) {
            setSelectedPlanId(planId);
            setShowPlansModal(true);
        } else {
            // Salvar plano selecionado no sessionStorage
            sessionStorage.setItem("selectedPlanId", planId);
            setSelectedPlanId(planId);
            // Abrir modal de login (será tratado na home)
            window.dispatchEvent(new CustomEvent("openLoginModal"));
        }
    };

    const handlePlanModalSuccess = () => {
        setShowPlansModal(false);
        setSelectedPlanId(undefined);
    };

    const formatPrice = (amount?: number, currency?: string) => {
        if (!amount) return "Grátis";
        const formatter = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: currency?.toUpperCase() || "BRL",
        });
        return formatter.format(amount);
    };

    return (
        <>
            <section id="precos" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Planos que se adaptam ao seu negócio
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Escolha o plano ideal para suas necessidades. Todos os planos incluem suporte completo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative overflow-hidden hover:shadow-xl transition-all ${
                                    plan.id === "PRO" ? "border-2 border-primary-500 scale-105" : ""
                                }`}
                            >
                                {plan.id === "PRO" && (
                                    <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                                        Popular
                                    </div>
                                )}
                                <CardHeader className="text-center pb-4">
                                    <div className="flex items-center justify-center mb-2">
                                        <Sparkles className="h-6 w-6 text-primary-600 mr-2" />
                                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold text-gray-900">
                                            {formatPrice(plan.amount, plan.currency)}
                                        </span>
                                        {plan.interval && (
                                            <span className="text-gray-600 text-sm ml-2">
                                                /{plan.interval === "month" ? "mês" : plan.interval}
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-success-600 flex-shrink-0" />
                                            <span className="text-gray-700">
                                                Até {plan.quizLimit} {plan.quizLimit === 1 ? "quiz" : "quizzes"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-success-600 flex-shrink-0" />
                                            <span className="text-gray-700">Analytics completo</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-success-600 flex-shrink-0" />
                                            <span className="text-gray-700">Captura de leads</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-success-600 flex-shrink-0" />
                                            <span className="text-gray-700">Suporte por email</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full mt-6"
                                        variant={plan.id === "PRO" ? "primary" : "outline"}
                                        onClick={() => handleSelectPlan(plan.id)}
                                    >
                                        {plan.id === "FREE" ? "Começar Grátis" : "Escolher Plano"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {isAuthenticated && (
                <PlansModal
                    isOpen={showPlansModal}
                    onClose={() => {
                        setShowPlansModal(false);
                        setSelectedPlanId(undefined);
                    }}
                    onSuccess={handlePlanModalSuccess}
                    selectedPlanId={selectedPlanId}
                />
            )}
        </>
    );
}

