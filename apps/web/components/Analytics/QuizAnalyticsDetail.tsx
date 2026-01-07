"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { QuizDetailAnalyticsResponse } from "@/app/dashboard/analytics/types";
import { ArrowLeft, TrendingDown } from "lucide-react";
import { Button } from "@repo/ui";

interface QuizAnalyticsDetailProps {
    data: QuizDetailAnalyticsResponse;
    onBack: () => void;
}

export default function QuizAnalyticsDetail({ data, onBack }: QuizAnalyticsDetailProps) {
    // Preparar dados para o gráfico de funil
    const funnelData = data.steps.map((step, index) => {
        const previousStep = index > 0 ? data.steps[index - 1] : null;
        const conversion = previousStep
            ? previousStep.usersReached > 0
                ? (step.usersReached / previousStep.usersReached) * 100
                : 0
            : 100;

        return {
            name: `Step ${step.stepOrder}`,
            stepTitle: step.stepTitle,
            usersReached: step.usersReached,
            usersCurrentlyHere: step.usersCurrentlyHere,
            dropoffRate: step.dropoffRate,
            conversion: Math.round(conversion * 100) / 100,
        };
    });

    const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

    return (
        <div className="space-y-6">
            {/* Header com botão voltar */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{data.quiz.title}</h2>
                    <p className="text-sm text-gray-500">Analytics detalhado</p>
                </div>
            </div>

            {/* Métricas do Quiz */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-600">Total de Sessões</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{data.overview.totalSessions}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-600">Sessões Ativas</p>
                        <p className="text-2xl font-bold text-success-600 mt-1">{data.overview.activeSessions}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-600">Sessões Completadas</p>
                        <p className="text-2xl font-bold text-primary-600 mt-1">{data.overview.completedSessions}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{data.overview.completionRate.toFixed(1)}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Funil */}
            {data.steps.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Funil de Conversão por Etapa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={funnelData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip
                                    formatter={(value: number, name: string) => {
                                        if (name === "usersReached") return [`${value} usuários`, "Chegaram"];
                                        if (name === "usersCurrentlyHere") return [`${value} usuários`, "Aqui agora"];
                                        return [value, name];
                                    }}
                                />
                                <Bar dataKey="usersReached" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Tabela de Steps */}
            <Card>
                <CardHeader>
                    <CardTitle>Métricas por Etapa</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Etapa</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Chegaram</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Aqui Agora</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Taxa de Abandono</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.steps.map((step, index) => (
                                    <tr key={step.stepId} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-500">#{step.stepOrder}</span>
                                                <span className="text-sm font-medium text-gray-900">{step.stepTitle}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                {step.stepType}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                                            {step.usersReached}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
                                                {step.usersCurrentlyHere}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {step.dropoffRate > 0 && (
                                                    <TrendingDown className="w-4 h-4 text-danger-500" />
                                                )}
                                                <span className={`text-sm font-semibold ${step.dropoffRate > 50 ? "text-danger-600" : step.dropoffRate > 25 ? "text-warning-600" : "text-gray-600"}`}>
                                                    {step.dropoffRate.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.steps.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <p>Nenhuma etapa encontrada neste quiz.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

