"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Download, Loader2 } from "lucide-react";

interface QuizExportButtonProps {
    quizId: string;
}

export default function QuizExportButton({ quizId }: QuizExportButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/admin/quizzes/${quizId}/export`, {
                responseType: 'blob',
            });

            // Criar URL temporária e fazer download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `quiz-export-${quizId}-${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Erro ao exportar quiz:', err);
            setError(err.response?.data?.message || 'Erro ao exportar quiz. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleExport}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Exportando...
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4" />
                        Exportar Quiz
                    </>
                )}
            </button>
            {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
        </div>
    );
}
