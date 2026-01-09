"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Edit, Trash2, Clock, Upload } from "lucide-react";
import { Button, Card, Badge } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import QuizImportModal from "@/components/Quiz/QuizImportModal";

interface Quiz {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    _count?: {
        steps: number;
        sessions: number;
    };
}

export default function DashboardPage() {
    const token = useAuthStore((state) => state.token);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [importModalOpen, setImportModalOpen] = useState(false);

    const loadQuizzes = async () => {
        if (token) {
            setLoading(true);
            try {
                const data = await apiFetch<Quiz[]>("/quizzes", { token });
                setQuizzes(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadQuizzes();
    }, [token]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Tem certeza que deseja excluir "${title}"?`)) return;

        try {
            await apiFetch(`/quizzes/${id}`, { method: "DELETE", token: token! });
            setQuizzes(quizzes.filter(q => q.id !== id));
        } catch (error) {
            alert("Erro ao excluir quiz");
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-64 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Plus className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Crie seu primeiro quiz</h2>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                    Comece a criar quizzes profissionais para capturar leads e engajar seu público
                </p>
                <Link href="/dashboard/quiz/new">
                    <Button size="lg" variant="primary">
                        <Plus className="mr-2 h-5 w-5" />
                        Criar Primeiro Quiz
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-700">
                        {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setImportModalOpen(true)}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Importar Quiz
                    </Button>
                    <Link href="/dashboard/quiz/new">
                        <Button variant="primary">
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Quiz
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                    <Card
                        key={quiz.id}
                        className="group hover-lift overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                        {/* Header com gradiente */}
                        <div className={`h-2 ${quiz.is_published ? 'bg-gradient-success' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`} />

                        <div className="p-6">
                            {/* Status Badge */}
                            <div className="flex items-start justify-between mb-4">
                                <Badge variant={quiz.is_published ? "success" : "default"}>
                                    {quiz.is_published ? "Publicado" : "Rascunho"}
                                </Badge>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(quiz.id, quiz.title)}
                                        className="p-2 hover:bg-danger-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 text-danger-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Título */}
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                {quiz.title}
                            </h3>

                            {/* Slug */}
                            <div className="flex items-center gap-2 text-sm text-primary-600 mb-4">
                                <ExternalLink className="h-3 w-3" />
                                <span className="truncate font-mono text-xs">/q/{quiz.slug}</span>
                            </div>

                            {/* Data */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                <Clock className="h-3 w-3" />
                                <span>
                                    {new Date(quiz.created_at).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Link href={`/dashboard/quiz/${quiz.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit className="mr-2 h-3 w-3" />
                                        Editar
                                    </Button>
                                </Link>
                                {quiz.is_published && (
                                    <Link href={`/q/${quiz.slug}`} target="_blank" className="flex-1">
                                        <Button variant="primary" size="sm" className="w-full">
                                            <ExternalLink className="mr-2 h-3 w-3" />
                                            Ver
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal de Importação */}
            <QuizImportModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={() => {
                    // Recarregar lista de quizzes após importação bem-sucedida
                    loadQuizzes();
                }}
            />
        </div>
    );
}
