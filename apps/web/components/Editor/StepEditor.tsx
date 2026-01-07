"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Save, Sparkles } from "lucide-react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import RichTextEditor from "./RichTextEditor";

interface Option {
    id?: string;
    text: string;
    value: string;
}

interface StepDetail {
    id: string;
    title: string;
    description: string | null;
    type: "QUESTION" | "TEXT" | "CAPTURE" | "RESULT";
    image_url: string | null;
    metadata?: {
        cta_text?: string;
        cta_link?: string;
        [key: string]: any;
    };
    question?: {
        id: string;
        text: string;
        options: Option[];
    };
}

export default function StepEditor({
    stepId,
    onUpdate,
}: {
    stepId: string;
    onUpdate: (s: any) => void;
}) {
    const token = useAuthStore((state) => state.token);
    const [step, setStep] = useState<StepDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (stepId) {
            setLoading(true);
            apiFetch<StepDetail>(`/steps/${stepId}`, { token: token! })
                .then(setStep)
                .finally(() => setLoading(false));
        }
    }, [stepId, token]);

    const handleSave = async () => {
        setSaving(true);

        try {
            const payload: any = {
                title: step!.title,
                description: step!.description,
                metadata: step!.metadata,
            };

            if (step!.type === "QUESTION" && step!.question) {
                payload.question = {
                    text: step!.question.text,
                    options: step!.question.options,
                };
            }

            const updated = await apiFetch<StepDetail>(`/steps/${stepId}`, {
                method: "PATCH",
                token: token!,
                body: JSON.stringify(payload),
            });

            setStep(updated);
            onUpdate(updated);
        } catch (e) {
            console.error(e);
            alert("Falha ao salvar");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !step) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                    <div className="h-12 bg-gray-200 rounded mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
                <CardTitle className="text-lg">Editar Step</CardTitle>
                <Button size="sm" onClick={handleSave} loading={saving} variant="primary">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Título (Interno)</label>
                    <Input value={step.title} onChange={(e) => setStep({ ...step, title: e.target.value })} />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Descrição / Texto</label>
                    <RichTextEditor
                        value={step.description || ""}
                        onChange={(html) => setStep({ ...step, description: html })}
                        placeholder={
                            step.type === "RESULT" 
                                ? "Escreva o conteúdo do resultado aqui..." 
                                : step.type === "QUESTION"
                                    ? "Adicione uma descrição ou contexto para a pergunta..."
                                    : step.type === "CAPTURE"
                                        ? "Escreva o texto para a captura de dados..."
                                        : "Escreva o conteúdo do texto aqui..."
                        }
                    />
                </div>

                {step.type === "QUESTION" && step.question && (
                    <div className="rounded-xl border-2 border-primary-100 bg-primary-50 p-6">
                        <div className="mb-6 space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Texto da Pergunta</label>
                            <Input
                                value={step.question.text}
                                onChange={(e) =>
                                    setStep({ ...step, question: { ...step.question!, text: e.target.value } })
                                }
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Opções de Resposta</label>
                            {step.question.options.map((opt, idx) => (
                                <div key={opt.id || `temp-${idx}`} className="flex gap-2">
                                    <div className="flex items-center justify-center w-8 h-10 bg-white rounded-lg border-2 border-gray-200 font-bold text-gray-400 text-sm">
                                        {idx + 1}
                                    </div>
                                    <Input
                                        placeholder="Texto da opção"
                                        value={opt.text}
                                        onChange={(e) => {
                                            const newOpts = [...step.question!.options];
                                            newOpts[idx].text = e.target.value;
                                            newOpts[idx].value = e.target.value;
                                            setStep({ ...step, question: { ...step.question!, options: newOpts } });
                                        }}
                                        className="bg-white"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newOpts = step.question!.options.filter((_, i) => i !== idx);
                                            setStep({ ...step, question: { ...step.question!, options: newOpts } });
                                        }}
                                        className="hover:bg-danger-50"
                                    >
                                        <Trash2 className="h-4 w-4 text-danger-500" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-2 border-dashed hover:border-primary-500 hover:bg-primary-50"
                                onClick={() => {
                                    const newOpts = [...step.question!.options, { text: "", value: "", id: `new-${Date.now()}` }];
                                    setStep({ ...step, question: { ...step.question!, options: newOpts } });
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Opção
                            </Button>
                        </div>
                    </div>
                )}
                {step.type === "CAPTURE" && (
                    <div className="rounded-xl border-2 border-success-100 bg-success-50 p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-success-600" />
                            <h3 className="font-semibold text-success-900">Campos de Captura</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Selecione quais campos deseja capturar. Pelo menos um campo deve estar selecionado.
                        </p>
                        <div className="space-y-3">
                            {[
                                { key: 'name', label: 'Nome' },
                                { key: 'email', label: 'E-mail' },
                                { key: 'phone', label: 'Telefone' },
                            ].map((field) => {
                                const captureFields = (step.metadata?.captureFields as any) || { name: true, email: true, phone: false };
                                const isChecked = captureFields[field.key] !== false;
                                
                                return (
                                    <label key={field.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-success-300 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                const currentFields = (step.metadata?.captureFields as any) || { name: true, email: true, phone: false };
                                                const newFields = { ...currentFields, [field.key]: e.target.checked };
                                                
                                                // Validar que pelo menos um campo está selecionado
                                                const hasAnyField = Object.values(newFields).some(v => v === true);
                                                if (!hasAnyField) {
                                                    alert('Pelo menos um campo deve estar selecionado');
                                                    return;
                                                }
                                                
                                                setStep({
                                                    ...step,
                                                    metadata: {
                                                        ...step.metadata,
                                                        captureFields: newFields,
                                                    },
                                                });
                                            }}
                                            className="w-5 h-5 text-success-600 rounded border-gray-300 focus:ring-success-500"
                                        />
                                        <span className="font-medium text-gray-900">{field.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
                {step.type === "RESULT" && (
                    <div className="rounded-xl border-2 border-primary-100 bg-primary-50 p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-primary-600" />
                            <h3 className="font-semibold text-primary-900">Customização da Landing Page</h3>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Texto do Botão de Ação (CTA)</label>
                            <Input
                                value={step.metadata?.cta_text || ""}
                                onChange={(e) => setStep({
                                    ...step,
                                    metadata: { ...step.metadata, cta_text: e.target.value }
                                })}
                                placeholder="Ex: Comprar Agora, Ver Resultados"
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">Link de Destino (URL)</label>
                            <Input
                                value={step.metadata?.cta_link || ""}
                                onChange={(e) => setStep({
                                    ...step,
                                    metadata: { ...step.metadata, cta_link: e.target.value }
                                })}
                                placeholder="Ex: https://checkout.kiwify.com.br/..."
                                className="bg-white"
                            />
                            <p className="text-xs text-gray-500">
                                Se preenchido, um botão será exibido no final do quiz levando para este link.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
