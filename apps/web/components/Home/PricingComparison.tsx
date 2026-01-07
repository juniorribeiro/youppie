"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui";
import { Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface Plan {
    id: string;
    name: string;
    quizLimit: number;
    priceId?: string;
    amount?: number;
    currency?: string;
    interval?: string;
}

export default function PricingComparison() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

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
            // Abrir modal de planos (será tratado na home)
            sessionStorage.setItem("selectedPlanId", planId);
            window.dispatchEvent(new CustomEvent("openPlansModal", { detail: { planId } }));
        } else {
            sessionStorage.setItem("selectedPlanId", planId);
            window.dispatchEvent(new CustomEvent("openLoginModal"));
        }
    };

    const formatPrice = (amount?: number, currency?: string) => {
        if (!amount) return "Grátis";
        const formatter = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: currency?.toUpperCase() || "BRL",
        });
        return formatter.format(amount);
    };

    const features = [
        { name: "Número de Quizzes", key: "quizLimit" },
        { name: "Analytics Completo", all: true },
        { name: "Captura de Leads", all: true },
        { name: "Exportação de Dados", all: true },
        { name: "Suporte por Email", all: true },
        { name: "Personalização Avançada", free: false },
        { name: "API Access", free: false, basic: false },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Compare os Planos
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Veja em detalhes o que cada plano oferece
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-4 font-semibold text-gray-700">Recursos</th>
                                {plans.map((plan) => (
                                    <th 
                                        key={plan.id} 
                                        className={`text-center p-4 font-semibold text-gray-700 relative ${
                                            plan.id === "PRO" 
                                                ? "bg-primary-50 border-2 border-primary-500 rounded-t-lg" 
                                                : ""
                                        }`}
                                    >
                                        <div className="flex flex-col items-center pt-4">
                                            {plan.id === "PRO" && (
                                                <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap z-10 shadow-lg">
                                                    Recomendado
                                                </span>
                                            )}
                                            <span className="text-lg">{plan.name}</span>
                                            <span className="text-2xl font-bold text-primary-600 mt-2">
                                                {formatPrice(plan.amount, plan.currency)}
                                            </span>
                                            {plan.interval && (
                                                <span className="text-sm text-gray-500">
                                                    /{plan.interval === "month" ? "mês" : plan.interval}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-700">{feature.name}</td>
                                    {plans.map((plan) => {
                                        let included = false;
                                        if (feature.all) {
                                            included = true;
                                        } else if (feature.key === "quizLimit") {
                                            included = true; // Mostrar número
                                        } else if (feature.free === false) {
                                            included = plan.id !== "FREE";
                                        } else if (feature.basic === false) {
                                            included = plan.id === "PRO" || plan.id === "ENTERPRISE";
                                        }

                                        return (
                                            <td 
                                                key={plan.id} 
                                                className={`p-4 text-center ${
                                                    plan.id === "PRO" ? "bg-primary-50" : ""
                                                }`}
                                            >
                                                {feature.key === "quizLimit" ? (
                                                    <span className="font-semibold text-gray-900">
                                                        {plan.quizLimit}
                                                    </span>
                                                ) : included ? (
                                                    <Check className="h-5 w-5 text-success-600 mx-auto" />
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr>
                                <td className="p-4"></td>
                                {plans.map((plan) => (
                                    <td key={plan.id} className="p-4 text-center">
                                        <Button
                                            variant={plan.id === "PRO" ? "primary" : "outline"}
                                            onClick={() => handleSelectPlan(plan.id)}
                                            className="w-full max-w-[180px] h-12"
                                        >
                                            {plan.id === "FREE" ? "Começar Grátis" : "Escolher"}
                                        </Button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

