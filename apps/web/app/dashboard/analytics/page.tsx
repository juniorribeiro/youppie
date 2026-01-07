"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth";
import { apiFetch } from "@/lib/api";
import {
    QuizzesAnalyticsResponse,
    QuizDetailAnalyticsResponse,
} from "./types";
import AnalyticsOverview from "@/components/Analytics/AnalyticsOverview";
import QuizAnalyticsDetail from "@/components/Analytics/QuizAnalyticsDetail";
import RealtimeMetrics from "@/components/Analytics/RealtimeMetrics";

type ViewMode = "overview" | "detail";

export default function AnalyticsPage() {
    const token = useAuthStore((state) => state.token);
    const [viewMode, setViewMode] = useState<ViewMode>("overview");
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    
    const [overviewData, setOverviewData] = useState<QuizzesAnalyticsResponse | null>(null);
    const [detailData, setDetailData] = useState<QuizDetailAnalyticsResponse | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    const fetchOverviewData = useCallback(async () => {
        if (!token || isPaused) return;

        try {
            setIsUpdating(true);
            const data = await apiFetch<QuizzesAnalyticsResponse>("/analytics/quizzes", { token });
            setOverviewData(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Erro ao buscar dados de analytics:", error);
        } finally {
            setIsUpdating(false);
        }
    }, [token, isPaused]);

    const fetchDetailData = useCallback(async (quizId: string) => {
        if (!token || isPaused) return;

        try {
            setIsUpdating(true);
            const data = await apiFetch<QuizDetailAnalyticsResponse>(`/analytics/quizzes/${quizId}`, { token });
            setDetailData(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Erro ao buscar detalhes do quiz:", error);
        } finally {
            setIsUpdating(false);
        }
    }, [token, isPaused]);

    // Carregamento inicial
    useEffect(() => {
        if (token) {
            setLoading(true);
            fetchOverviewData().finally(() => setLoading(false));
        }
    }, [token, fetchOverviewData]);

    // Polling para atualização em tempo real
    useEffect(() => {
        if (isPaused || !token) return;

        const interval = setInterval(() => {
            if (viewMode === "overview") {
                fetchOverviewData();
            } else if (viewMode === "detail" && selectedQuizId) {
                fetchDetailData(selectedQuizId);
            }
        }, 5000); // Atualizar a cada 5 segundos

        return () => clearInterval(interval);
    }, [viewMode, selectedQuizId, isPaused, token, fetchOverviewData, fetchDetailData]);

    const handleQuizSelect = (quizId: string) => {
        setSelectedQuizId(quizId);
        setViewMode("detail");
        setLoading(true);
        fetchDetailData(quizId).finally(() => setLoading(false));
    };

    const handleBack = () => {
        setViewMode("overview");
        setSelectedQuizId(null);
        setDetailData(null);
    };

    if (loading && !overviewData && !detailData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-sm text-gray-500 mt-1">Estatísticas em tempo real dos seus quizzes</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Estatísticas em tempo real dos seus quizzes</p>
                </div>
                <RealtimeMetrics
                    isUpdating={isUpdating}
                    lastUpdated={lastUpdated}
                    isPaused={isPaused}
                    onToggle={() => setIsPaused(!isPaused)}
                />
            </div>

            {/* Conteúdo */}
            {viewMode === "overview" && overviewData && (
                <div>
                    <AnalyticsOverview data={overviewData} />
                    {overviewData.quizzes.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecione um quiz para ver detalhes:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {overviewData.quizzes.map((quiz) => (
                                    <button
                                        key={quiz.id}
                                        onClick={() => handleQuizSelect(quiz.id)}
                                        className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
                                    >
                                        <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                            <span>{quiz.totalSessions} acessos</span>
                                            <span className="text-success-600">{quiz.activeSessions} ativos</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewMode === "detail" && detailData && (
                <QuizAnalyticsDetail data={detailData} onBack={handleBack} />
            )}
        </div>
    );
}

