"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { CheckCircle, XCircle, Clock, Calendar, DollarSign, FileText } from "lucide-react";
import PlansModal from "@/components/Subscription/PlansModal";
import LoadingOverlay from "@/components/Loading/LoadingOverlay";

interface Invoice {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paid: boolean;
    date: string;
    periodStart: string | null;
    periodEnd: string | null;
    description: string;
}

interface CurrentSubscription {
    id: string;
    status: string;
    plan: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
}

interface SubscriptionHistory {
    currentSubscription: CurrentSubscription | null;
    invoices: Invoice[];
}

export default function SubscriptionPage() {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const [history, setHistory] = useState<SubscriptionHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPlansModal, setShowPlansModal] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token) return;

            try {
                const data = await apiFetch<SubscriptionHistory>("/subscriptions/history", {
                    token,
                });
                setHistory(data);
            } catch (error) {
                console.error("Erro ao buscar histórico:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            active: { label: "Ativa", className: "bg-success-100 text-success-700" },
            canceled: { label: "Cancelada", className: "bg-gray-100 text-gray-700" },
            past_due: { label: "Atrasada", className: "bg-danger-100 text-danger-700" },
            unpaid: { label: "Não Paga", className: "bg-warning-100 text-warning-700" },
            paid: { label: "Paga", className: "bg-success-100 text-success-700" },
            open: { label: "Aberta", className: "bg-blue-100 text-blue-700" },
            draft: { label: "Rascunho", className: "bg-gray-100 text-gray-700" },
        };

        const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-700" };

        return (
            <Badge className={statusInfo.className}>
                {statusInfo.label}
            </Badge>
        );
    };

    const getPlanName = (plan: string) => {
        const planMap: Record<string, string> = {
            FREE: "Youppie Free",
            BASIC: "Youppie Basic",
            PRO: "Youppie Pro",
            ENTERPRISE: "Youppie Enterprise",
        };
        return planMap[plan] || plan;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingOverlay isLoading={true} message="Carregando histórico..." />
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Minha Assinatura</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie sua assinatura e veja o histórico de pagamentos</p>
                </div>
                <Button variant="primary" onClick={() => setShowPlansModal(true)}>
                    Alterar Plano
                </Button>
            </div>

            {/* Subscription Atual */}
            {history?.currentSubscription && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Assinatura Atual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Plano</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {getPlanName(history.currentSubscription.plan)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                {getStatusBadge(history.currentSubscription.status)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Período Atual</p>
                                <p className="text-sm text-gray-900">
                                    {formatDate(history.currentSubscription.currentPeriodStart)} -{" "}
                                    {formatDate(history.currentSubscription.currentPeriodEnd)}
                                </p>
                            </div>
                            {history.currentSubscription.cancelAtPeriodEnd && (
                                <div>
                                    <p className="text-sm text-warning-600 font-medium">
                                        Esta assinatura será cancelada ao final do período atual
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Histórico de Invoices */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Histórico de Pagamentos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {history?.invoices && history.invoices.length > 0 ? (
                        <div className="space-y-4">
                            {history.invoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`p-2 rounded-lg ${
                                            invoice.paid
                                                ? "bg-success-100 text-success-600"
                                                : "bg-gray-100 text-gray-600"
                                        }`}>
                                            {invoice.paid ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <XCircle className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{invoice.description}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(invoice.date)}
                                                </p>
                                                {invoice.periodStart && invoice.periodEnd && (
                                                    <p className="text-sm text-gray-500">
                                                        Período: {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(invoice.amount, invoice.currency)}
                                            </p>
                                            {getStatusBadge(invoice.status)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Nenhum pagamento encontrado</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <PlansModal
                isOpen={showPlansModal}
                onClose={() => setShowPlansModal(false)}
                onSuccess={() => {
                    setShowPlansModal(false);
                    // Recarregar histórico
                    window.location.reload();
                }}
                currentPlan={user?.subscription_plan}
            />
        </div>
    );
}

