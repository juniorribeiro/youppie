"use client";

import { RefreshCw } from "lucide-react";

interface RealtimeMetricsProps {
    isUpdating: boolean;
    lastUpdated: Date | null;
    onToggle?: () => void;
    isPaused?: boolean;
}

export default function RealtimeMetrics({
    isUpdating,
    lastUpdated,
    onToggle,
    isPaused = false,
}: RealtimeMetricsProps) {
    const formatTime = (date: Date | null) => {
        if (!date) return "Nunca";
        return new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(date);
    };

    return (
        <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
                {isUpdating ? (
                    <>
                        <RefreshCw className="w-4 h-4 animate-spin text-primary-600" />
                        <span className="text-primary-600">Atualizando...</span>
                    </>
                ) : (
                    <>
                        <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                        <span>Em tempo real</span>
                    </>
                )}
            </div>
            {lastUpdated && (
                <span className="text-gray-500">
                    Última atualização: {formatTime(lastUpdated)}
                </span>
            )}
            {onToggle && (
                <button
                    onClick={onToggle}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                >
                    {isPaused ? "Retomar" : "Pausar"}
                </button>
            )}
        </div>
    );
}

