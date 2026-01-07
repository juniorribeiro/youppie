"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import PlansModal from "@/components/Subscription/PlansModal";
import LimitWarning from "@/components/Notifications/LimitWarning";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";

export default function NewQuizPage() {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [showLimitWarning, setShowLimitWarning] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<string | undefined>();
    const subscriptionLimit = useSubscriptionLimit();

    useEffect(() => {
        // Buscar plano atual do usuário
        const fetchSubscription = async () => {
            try {
                const subscription = await apiFetch<{ plan: string }>("/subscriptions/me", {
                    token: token!,
                });
                setCurrentPlan(subscription.plan);
            } catch (error) {
                console.error("Erro ao buscar assinatura:", error);
            }
        };
        if (token) {
            fetchSubscription();
        }
    }, [token]);

    useEffect(() => {
        // Mostrar warning se próximo do limite
        if (subscriptionLimit.isNearLimit && !subscriptionLimit.isAtLimit && !showLimitWarning) {
            setShowLimitWarning(true);
        }
    }, [subscriptionLimit.isNearLimit, subscriptionLimit.isAtLimit, showLimitWarning]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Verificar limite antes de criar
        if (subscriptionLimit.isAtLimit) {
            setShowPlansModal(true);
            return;
        }
        
        setLoading(true);

        try {
            const quiz = await apiFetch<{ id: string }>("/quizzes", {
                method: "POST",
                token: token!,
                body: JSON.stringify({ title }),
            });
            router.push(`/dashboard/quiz/${quiz.id}`);
        } catch (error: any) {
            console.error("Erro completo:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            // Verificar se é erro de limite atingido
            if (error.code === "QUIZ_LIMIT_REACHED") {
                setShowPlansModal(true);
            } else {
                alert(error.message || "Falha ao criar quiz");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubscriptionSuccess = async () => {
        setShowPlansModal(false);
        
        // Atualizar o plano atual antes de tentar criar o quiz
        try {
            const subscription = await apiFetch<{ plan: string }>("/subscriptions/me", {
                token: token!,
            });
            setCurrentPlan(subscription.plan);
        } catch (error) {
            console.error("Erro ao atualizar plano:", error);
        }
        
        // Aguardar um pouco para garantir que o webhook processou
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Tentar criar o quiz novamente após upgrade
        if (title.trim()) {
            setLoading(true);
            try {
                const quiz = await apiFetch<{ id: string }>("/quizzes", {
                    method: "POST",
                    token: token!,
                    body: JSON.stringify({ title }),
                });
                router.push(`/dashboard/quiz/${quiz.id}`);
            } catch (error: any) {
                console.error(error);
                if (error.code === "QUIZ_LIMIT_REACHED") {
                    setShowPlansModal(true);
                } else {
                    alert(error.message || "Falha ao criar quiz");
                }
            } finally {
                setLoading(false);
            }
        } else {
            // Se não tinha título, apenas redirecionar para dashboard
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl animate-fade-in">
                <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Header com gradiente */}
                    <div className="bg-gradient-primary p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-bold">Criar Novo Quiz</h1>
                        </div>
                        <p className="text-white text-opacity-90">
                            Dê o primeiro passo para criar uma experiência incrível
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">
                                    Título do Quiz
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Diagnóstico de Vendas B2B"
                                    required
                                    className="text-lg"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500">
                                    Escolha um título atrativo e descritivo para seu quiz
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Link href="/dashboard" className="flex-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Voltar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={loading || !title.trim()}
                                    loading={loading}
                                    className="flex-1"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Criar e Começar
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>

            <PlansModal
                isOpen={showPlansModal}
                onClose={() => setShowPlansModal(false)}
                onSuccess={handleSubscriptionSuccess}
                currentPlan={currentPlan}
            />
            <LimitWarning
                isOpen={showLimitWarning}
                onClose={() => setShowLimitWarning(false)}
                current={subscriptionLimit.current}
                limit={subscriptionLimit.limit}
                onUpgrade={() => {
                    setShowLimitWarning(false);
                    setShowPlansModal(true);
                }}
            />
        </div>
    );
}
