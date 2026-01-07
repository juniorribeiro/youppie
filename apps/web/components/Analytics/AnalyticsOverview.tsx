"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { QuizzesAnalyticsResponse } from "@/app/dashboard/analytics/types";
import { TrendingUp, Users, CheckCircle, Clock } from "lucide-react";

interface AnalyticsOverviewProps {
    data: QuizzesAnalyticsResponse;
}

export default function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
    const chartData = data.quizzes.map((quiz) => ({
        name: quiz.title.length > 20 ? quiz.title.substring(0, 20) + "..." : quiz.title,
        "Total de Acessos": quiz.totalSessions,
        "Acessos Ativos": quiz.activeSessions,
        "Completados": quiz.completedSessions,
    }));

    return (
        <div className="space-y-6">
            {/* Métricas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total de Sessões</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalSessions}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sessões Ativas</p>
                                <p className="text-2xl font-bold text-success-600 mt-1">{data.activeSessions}</p>
                            </div>
                            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-success-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sessões Completadas</p>
                                <p className="text-2xl font-bold text-primary-600 mt-1">{data.completedSessions}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{data.completionRate.toFixed(1)}%</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Barras */}
            {data.quizzes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Acessos por Quiz</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    interval={0}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Total de Acessos" fill="#3b82f6" />
                                <Bar dataKey="Acessos Ativos" fill="#10b981" />
                                <Bar dataKey="Completados" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Quizzes */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Quizzes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.quizzes.map((quiz) => (
                        <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base">{quiz.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-semibold">{quiz.totalSessions}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Ativos:</span>
                                    <span className="font-semibold text-success-600">{quiz.activeSessions}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Completados:</span>
                                    <span className="font-semibold text-primary-600">{quiz.completedSessions}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t">
                                    <span className="text-gray-600">Taxa de Conclusão:</span>
                                    <span className="font-semibold">{quiz.completionRate.toFixed(1)}%</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {data.quizzes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>Nenhum quiz encontrado. Crie seu primeiro quiz para ver as estatísticas!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

