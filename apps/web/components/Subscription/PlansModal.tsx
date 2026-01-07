"use client";

import { useState, useEffect } from "react";
import { X, Check, Sparkles } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@repo/ui";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import PaymentForm from "./PaymentForm";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingOverlay from "@/components/Loading/LoadingOverlay";

interface Plan {
    id: string;
    name: string;
    quizLimit: number;
    priceId?: string;
    amount?: number; // Preço em centavos
    currency?: string;
    interval?: string;
}

interface PlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentPlan?: string;
}

export default function PlansModal({ isOpen, onClose, onSuccess, currentPlan, selectedPlanId, onPlanSelected }: PlansModalProps) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const updateUser = useAuthStore((state) => state.updateUser);

    const fetchPlans = async () => {
        try {
            const data = await apiFetch<Plan[]>("/subscriptions/plans", { token: token! });
            setPlans(data);
        } catch (error) {
            console.error("Erro ao buscar planos:", error);
        }
    };

    const handleSelectPlan = async (plan: Plan) => {
        if (plan.id === "FREE") {
            // Não precisa de pagamento para Free
            return;
        }

        if (plan.id === currentPlan) {
            // Já está neste plano
            return;
        }

        // Se não estiver autenticado, chamar callback e fechar modal
        if (!isAuthenticated) {
            if (onPlanSelected) {
                onPlanSelected(plan.id);
            }
            onClose();
            return;
        }

        setSelectedPlan(plan);
        setLoading(true);

        try {
            const response = await apiFetch<{ clientSecret: string }>("/subscriptions/create-intent", {
                method: "POST",
                token: token!,
                body: JSON.stringify({ plan: plan.id }),
            });
            setClientSecret(response.clientSecret);
        } catch (error: any) {
            console.error("Erro ao criar intent:", error);
            alert(error.message || "Erro ao processar assinatura");
            setLoading(false);
            setSelectedPlan(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        setSelectedPlan(null);
        setClientSecret(null);
        setVerifying(true);
        
        // Verificar e atualizar a assinatura diretamente do Stripe
        // Isso funciona mesmo sem webhook em desenvolvimento
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
                // Chamar endpoint para verificar e atualizar a subscription
                const verifyResult = await apiFetch<{ updated: boolean; message: string }>("/subscriptions/verify", {
                    method: "POST",
                    token: token!,
                });

                // Verificar se foi atualizada
                const subscription = await apiFetch<{ plan: string; status: string }>("/subscriptions/me", {
                    token: token!,
                });

                // Se a subscription está ativa, sucesso!
                if (subscription.status === 'active') {
                    // Atualizar user no store com o novo plano
                    updateUser({
                        subscription_plan: subscription.plan,
                        subscription_status: subscription.status,
                    });
                    setVerifying(false);
                    onSuccess();
                    onClose();
                    return;
                }
            } catch (error: any) {
                console.error("Erro ao verificar assinatura:", error);
            }
            
            attempts++;
        }
        
        // Mesmo se não atualizou, vamos fechar e tentar
        // O usuário pode tentar criar o quiz novamente
        setVerifying(false);
        onSuccess();
        onClose();
    };

    const handlePaymentError = (error: string) => {
        console.error("Erro no pagamento:", error);
    };

    // IMPORTANTE: Todos os hooks devem ser chamados ANTES de qualquer early return
    // Carregar planos quando modal abrir
    useEffect(() => {
        if (isOpen && plans.length === 0) {
            fetchPlans();
        }
    }, [isOpen]);

    // Pré-selecionar plano se selectedPlanId for fornecido
    useEffect(() => {
        if (selectedPlanId && plans.length > 0 && isAuthenticated && !selectedPlan) {
            const planToSelect = plans.find(p => p.id === selectedPlanId);
            if (planToSelect && planToSelect.id !== "FREE") {
                // Usar setTimeout para evitar chamada durante render
                setTimeout(() => {
                    handleSelectPlan(planToSelect);
                }, 100);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPlanId, plans, isAuthenticated]);

    // Early return DEPOIS de todos os hooks
    if (!isOpen) return null;

    return (
        <>
            <LoadingOverlay isLoading={verifying} message="Verificando assinatura..." />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Escolha seu Plano</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {!selectedPlan || !clientSecret ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {plans.map((plan) => {
                                const isCurrentPlan = plan.id === currentPlan;
                                const isFree = plan.id === "FREE";
                                
                                // Lógica de sugestão de upgrade
                                const getRecommendedPlan = () => {
                                    if (currentPlan === "FREE") return "BASIC";
                                    if (currentPlan === "BASIC") return "PRO";
                                    if (currentPlan === "PRO") return "ENTERPRISE";
                                    return null;
                                };
                                const recommendedPlan = getRecommendedPlan();
                                const isRecommended = plan.id === recommendedPlan && !isCurrentPlan;

                                return (
                                    <Card
                                        key={plan.id}
                                        className={`relative transition-all ${
                                            isCurrentPlan
                                                ? "border-primary-500 border-2 shadow-lg"
                                                : isRecommended
                                                ? "border-success-500 border-2 shadow-lg scale-105"
                                                : "hover:shadow-md cursor-pointer"
                                        }`}
                                    >
                                        {isCurrentPlan && (
                                            <div className="absolute top-3 right-3">
                                                <Badge className="bg-primary-500 text-white">
                                                    Atual
                                                </Badge>
                                            </div>
                                        )}
                                        {isRecommended && (
                                            <div className="absolute top-3 right-3">
                                                <Badge className="bg-success-500 text-white">
                                                    Recomendado
                                                </Badge>
                                            </div>
                                        )}
                                        <CardHeader>
                                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                                            <div className="mt-2">
                                                {plan.amount !== undefined && plan.amount > 0 ? (
                                                    <div>
                                                        <span className="text-3xl font-bold text-gray-900">
                                                            R$ {plan.amount.toFixed(2).replace('.', ',')}
                                                        </span>
                                                        <span className="text-gray-600 ml-1 text-sm">
                                                            /{plan.interval === 'year' ? 'ano' : 'mês'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="text-3xl font-bold text-gray-900">
                                                            {plan.quizLimit}
                                                        </span>
                                                        <span className="text-gray-600 ml-1">
                                                            {plan.quizLimit === 1 ? "Quiz" : "Quizzes"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <ul className="space-y-2">
                                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Check className="h-4 w-4 text-primary-600" />
                                                    <span>Até {plan.quizLimit} quizzes</span>
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Check className="h-4 w-4 text-primary-600" />
                                                    <span>Suporte completo</span>
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Check className="h-4 w-4 text-primary-600" />
                                                    <span>Analytics avançado</span>
                                                </li>
                                            </ul>
                                            {isRecommended && (
                                                <div className="bg-success-50 border border-success-200 rounded-lg p-3 mb-2">
                                                    <p className="text-xs text-success-700 font-medium">
                                                        Upgrade recomendado para continuar criando mais quizzes!
                                                    </p>
                                                </div>
                                            )}
                                            <Button
                                                onClick={() => handleSelectPlan(plan)}
                                                disabled={isCurrentPlan || isFree || loading}
                                                variant={isCurrentPlan ? "secondary" : isRecommended ? "primary" : "outline"}
                                                className="w-full"
                                            >
                                                {isCurrentPlan
                                                    ? "Plano Atual"
                                                    : isFree
                                                    ? "Gratuito"
                                                    : "Escolher Plano"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2">
                                    Finalizar Assinatura - {selectedPlan.name}
                                </h3>
                                <p className="text-gray-600">
                                    Preencha os dados de pagamento para ativar sua assinatura
                                </p>
                            </div>
                            <Elements
                                stripe={getStripe()}
                                options={{
                                    clientSecret,
                                    appearance: {
                                        theme: "stripe",
                                    },
                                }}
                            >
                                <PaymentForm
                                    clientSecret={clientSecret}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                />
                            </Elements>
                            <div className="mt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSelectedPlan(null);
                                        setClientSecret(null);
                                    }}
                                    className="w-full"
                                >
                                    Voltar para planos
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

