"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Settings as SettingsIcon, Sparkles, Globe, Code } from "lucide-react";
import { Button, Input, Card, CardContent, Badge } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import StepsList from "./StepsList";
import QuizFlowEditor from "./QuizFlowEditor";
import QuizExportButton from "../Quiz/QuizExportButton";
import QuizImportModal from "../Quiz/QuizImportModal";

// Hook helper para gerenciar placeholders dinâmicos
function usePlaceholder(originalPlaceholder: string) {
    const [focused, setFocused] = useState(false);
    const placeholder = focused ? "" : originalPlaceholder;
    
    return {
        placeholder,
        onFocus: () => setFocused(true),
        onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (!e.target.value) {
                setFocused(false);
            }
        },
    };
}

interface QuizEditorProps {
    initialQuiz: any;
}

export default function QuizEditor({ initialQuiz }: QuizEditorProps) {
    const token = useAuthStore((state) => state.token);
    const [quiz, setQuiz] = useState(initialQuiz);
    const [activeTab, setActiveTab] = useState<"build" | "settings">("build");
    const [buildMode, setBuildMode] = useState<"list" | "flow">("list");
    const [saving, setSaving] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    
    // Placeholders dinâmicos
    const descriptionPlaceholder = usePlaceholder("Descreva brevemente seu quiz");
    const gaPlaceholder = usePlaceholder("Cole aqui o código completo do Google Analytics");
    const gtmPlaceholder = usePlaceholder("Cole aqui o código completo do Google Tag Manager");
    const fbPixelPlaceholder = usePlaceholder("Cole aqui o código completo do Facebook Pixel");
    const trackingHeadPlaceholder = usePlaceholder("Código que será injetado no <head>");
    const trackingBodyPlaceholder = usePlaceholder("Código que será injetado antes de </body>");
    const trackingFooterPlaceholder = usePlaceholder("Código que será injetado no final do <body>");

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
            google_analytics_id: quiz.google_analytics_id || undefined,
            google_tag_manager_id: quiz.google_tag_manager_id || undefined,
            facebook_pixel_id: quiz.facebook_pixel_id || undefined,
            tracking_head: quiz.tracking_head || undefined,
            tracking_body: quiz.tracking_body || undefined,
            tracking_footer: quiz.tracking_footer || undefined,
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
                            <QuizExportButton quizId={quiz.id} />
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setImportModalOpen(true)}
                                className="flex-1 sm:flex-none"
                            >
                                Importar
                            </Button>
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
                    <div className="space-y-4">
                        {/* Toggle Lista/Flow */}
                        <div className="flex gap-2 border-b border-gray-200 pb-4">
                            <button
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    buildMode === "list"
                                        ? "bg-primary-100 text-primary-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                onClick={() => setBuildMode("list")}
                            >
                                Lista
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    buildMode === "flow"
                                        ? "bg-primary-100 text-primary-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                onClick={() => setBuildMode("flow")}
                            >
                                Flow Visual
                            </button>
                        </div>

                        {/* Renderizar modo selecionado */}
                        {buildMode === "list" ? (
                            <StepsList quizId={quiz.id} />
                        ) : (
                            <QuizFlowEditor quizId={quiz.id} />
                        )}
                    </div>
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
                                    onFocus={descriptionPlaceholder.onFocus}
                                    onBlur={descriptionPlaceholder.onBlur}
                                    placeholder={descriptionPlaceholder.placeholder}
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
                            
                            <div className="pt-6 border-t">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Pixel/Scripts
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Configure códigos de acompanhamento e integrações que serão aplicados apenas neste quiz
                                </p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Google Analytics ID
                                        </label>
                                        <textarea
                                            value={quiz.google_analytics_id || ""}
                                            onChange={(e) => handleUpdate({ google_analytics_id: e.target.value })}
                                            onFocus={gaPlaceholder.onFocus}
                                            onBlur={gaPlaceholder.onBlur}
                                            placeholder={gaPlaceholder.placeholder}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Cole o código completo do script do Google Analytics
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Google Tag Manager ID
                                        </label>
                                        <textarea
                                            value={quiz.google_tag_manager_id || ""}
                                            onChange={(e) => handleUpdate({ google_tag_manager_id: e.target.value })}
                                            onFocus={gtmPlaceholder.onFocus}
                                            onBlur={gtmPlaceholder.onBlur}
                                            placeholder={gtmPlaceholder.placeholder}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Cole o código completo do script do Google Tag Manager
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Facebook Pixel ID
                                        </label>
                                        <textarea
                                            value={quiz.facebook_pixel_id || ""}
                                            onChange={(e) => handleUpdate({ facebook_pixel_id: e.target.value })}
                                            onFocus={fbPixelPlaceholder.onFocus}
                                            onBlur={fbPixelPlaceholder.onBlur}
                                            placeholder={fbPixelPlaceholder.placeholder}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Cole o código completo do script do Facebook Pixel
                                        </p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Códigos Customizados</h4>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Head
                                                </label>
                                                <textarea
                                                    value={quiz.tracking_head || ""}
                                                    onChange={(e) => handleUpdate({ tracking_head: e.target.value })}
                                                    onFocus={trackingHeadPlaceholder.onFocus}
                                                    onBlur={trackingHeadPlaceholder.onBlur}
                                                    placeholder={trackingHeadPlaceholder.placeholder}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Código que será injetado dentro da tag &lt;head&gt;
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Body
                                                </label>
                                                <textarea
                                                    value={quiz.tracking_body || ""}
                                                    onChange={(e) => handleUpdate({ tracking_body: e.target.value })}
                                                    onFocus={trackingBodyPlaceholder.onFocus}
                                                    onBlur={trackingBodyPlaceholder.onBlur}
                                                    placeholder={trackingBodyPlaceholder.placeholder}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Código que será injetado antes do fechamento da tag &lt;/body&gt;
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Footer
                                                </label>
                                                <textarea
                                                    value={quiz.tracking_footer || ""}
                                                    onChange={(e) => handleUpdate({ tracking_footer: e.target.value })}
                                                    onFocus={trackingFooterPlaceholder.onFocus}
                                                    onBlur={trackingFooterPlaceholder.onBlur}
                                                    placeholder={trackingFooterPlaceholder.placeholder}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Código que será injetado no final da tag &lt;body&gt;
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Importar / Exportar</h3>
                                <div className="flex gap-3">
                                    <QuizExportButton quizId={quiz.id} />
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setImportModalOpen(true)}
                                    >
                                        Importar Quiz
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Exporte este quiz para backup ou importe um quiz existente
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Import Modal */}
            <QuizImportModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={() => {
                    // Recarregar a página após importação bem-sucedida
                    window.location.reload();
                }}
            />
        </div>
    );
}
