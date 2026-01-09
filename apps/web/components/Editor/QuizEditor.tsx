"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Settings as SettingsIcon, Sparkles, Globe } from "lucide-react";
import { Button, Input, Card, CardContent, Badge } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import StepsList from "./StepsList";

interface QuizEditorProps {
    initialQuiz: any;
}

export default function QuizEditor({ initialQuiz }: QuizEditorProps) {
    const token = useAuthStore((state) => state.token);
    const [quiz, setQuiz] = useState(initialQuiz);
    const [activeTab, setActiveTab] = useState<"build" | "settings">("build");
    const [saving, setSaving] = useState(false);

    const handleUpdate = async (data: Partial<typeof quiz>) => {
        setQuiz({ ...quiz, ...data });
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            title: quiz.title,
            description: quiz.description,
            is_published: quiz.is_published,
            auto_advance: quiz.auto_advance,
        };
        
        try {
            const updated = await apiFetch<any>(`/quizzes/${quiz.id}`, {
                method: "PATCH",
                token: token!,
                body: JSON.stringify(payload),
            });
            
            setQuiz({ ...quiz, ...updated });
            alert("✅ Configurações salvas com sucesso!");
        } catch (e: any) {
            console.error(e);
            alert("❌ Falha ao salvar");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Fixo */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Left */}
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
                                    <Badge variant={quiz.is_published ? "success" : "default"}>
                                        {quiz.is_published ? "Publicado" : "Rascunho"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500">Edite seu quiz abaixo</p>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Link href={`/q/${quiz.slug}`} target="_blank" className="flex-1 sm:flex-none">
                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Visualizar
                                </Button>
                            </Link>
                            <Button size="sm" onClick={handleSave} loading={saving} variant="primary" className="flex-1 sm:flex-none">
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-6 py-8">
                {/* Tabs */}
                <div className="mb-8 flex gap-2 border-b border-gray-200">
                    <button
                        className={`relative px-6 py-3 font-semibold transition-colors ${activeTab === "build"
                            ? "text-primary-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("build")}
                    >
                        <Sparkles className="inline-block mr-2 h-4 w-4" />
                        Construtor
                        {activeTab === "build" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary rounded-full" />
                        )}
                    </button>
                    <button
                        className={`relative px-6 py-3 font-semibold transition-colors ${activeTab === "settings"
                            ? "text-primary-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("settings")}
                    >
                        <SettingsIcon className="inline-block mr-2 h-4 w-4" />
                        Configurações
                        {activeTab === "settings" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary rounded-full" />
                        )}
                    </button>
                </div>

                {/* Content */}
                {activeTab === "build" ? (
                    <StepsList quizId={quiz.id} />
                ) : (
                    <Card className="max-w-2xl border-0 shadow-lg">
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Título</label>
                                <Input
                                    value={quiz.title}
                                    onChange={(e) => handleUpdate({ title: e.target.value })}
                                    className="text-lg"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Descrição</label>
                                <Input
                                    value={quiz.description || ""}
                                    onChange={(e) => handleUpdate({ description: e.target.value })}
                                    placeholder="Descreva brevemente seu quiz"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="auto_advance"
                                    checked={quiz.auto_advance || false}
                                    onChange={(e) => handleUpdate({ auto_advance: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="auto_advance" className="flex-1 flex items-center gap-2 cursor-pointer">
                                    <Sparkles className="h-4 w-4 text-gray-600" />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900">Avanço Automático</span>
                                        <p className="text-xs text-gray-500">Pular para próxima pergunta ao selecionar resposta</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="published"
                                    checked={quiz.is_published}
                                    onChange={(e) => handleUpdate({ is_published: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="published" className="flex-1 flex items-center gap-2 cursor-pointer">
                                    <Globe className="h-4 w-4 text-gray-600" />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900">Publicado</span>
                                        <p className="text-xs text-gray-500">Tornar quiz acessível publicamente</p>
                                    </div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
