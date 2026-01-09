"use client";

import { useState } from "react";
import { Button } from "@repo/ui";
import { Download, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

interface QuizExportButtonProps {
    quizId: string;
}

export default function QuizExportButton({ quizId }: QuizExportButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = useAuthStore((state) => state.token);
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

    const handleExport = async () => {
        if (!token) {
            setError("Você precisa estar autenticado para exportar");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/quizzes/${quizId}/export`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao exportar quiz');
            }

            // Obter o blob do arquivo ZIP
            const blob = await response.blob();
            
            // Criar URL temporária e fazer download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quiz-export-${quizId}-${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Erro ao exportar quiz:', err);
            setError(err.message || 'Erro ao exportar quiz. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Button
                onClick={handleExport}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
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
            </Button>
            {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
        </div>
    );
}
