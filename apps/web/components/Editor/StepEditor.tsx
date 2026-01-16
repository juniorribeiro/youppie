"use client";

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Trash2, Plus, Save, Sparkles, Upload, X, Image as ImageIcon, ChevronDown, ChevronUp, Code, Edit } from "lucide-react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import RichTextEditor from "./RichTextEditor";
import Image from "next/image";

interface Option {
    id?: string;
    text: string;
    value: string;
}

interface StepDetail {
    id: string;
    title: string;
    description: string | null;
    type: "QUESTION" | "TEXT" | "CAPTURE" | "RESULT" | "INPUT";
    image_url: string | null;
    metadata?: {
        cta_text?: string;
        cta_link?: string;
        variableName?: string;
        inputType?: 'text' | 'number' | 'email';
        [key: string]: any;
    };
    question?: {
        id: string;
        text: string;
        options: Option[];
    };
}

interface StepList {
    id: string;
    title: string;
    type: string;
    order: number;
    question?: {
        options?: Array<{ value: string; text: string }>;
    };
}

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

export interface StepEditorRef {
    save: () => Promise<void>;
}

const StepEditor = forwardRef<StepEditorRef, {
    stepId: string;
    quizId: string;
    onUpdate: (s: any) => void;
}>(({
    stepId,
    quizId,
    onUpdate,
}, ref) => {
    const token = useAuthStore((state) => state.token);
    const [step, setStep] = useState<StepDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [rulesEditMode, setRulesEditMode] = useState<'visual' | 'json'>('visual');
    const [rulesJsonError, setRulesJsonError] = useState<string | null>(null);
    const [quizSteps, setQuizSteps] = useState<StepList[]>([]);
    
    // Placeholders dinâmicos para campos
    const optionPlaceholder = usePlaceholder("Texto da opção");
    const minScorePlaceholder = usePlaceholder("1");
    const maxScorePlaceholder = usePlaceholder("Sem limite");
    const variableNamePlaceholder = usePlaceholder("Ex: nome, idade, peso");
    const ctaTextPlaceholder = usePlaceholder("Ex: Comprar Agora, Ver Resultados");
    const ctaLinkPlaceholder = usePlaceholder("Ex: https://checkout.kiwify.com.br/...");
    const conditionVariablePlaceholder = usePlaceholder("Nome da variável");
    const conditionValuePlaceholder = usePlaceholder("Valor");
    const actionSkipPlaceholder = usePlaceholder("ou número");
    const actionVariableNamePlaceholder = usePlaceholder("Nome da variável");
    const actionVariableValuePlaceholder = usePlaceholder("Valor");
    const actionScorePlaceholder = usePlaceholder("Pontos (número)");
    const actionMessagePlaceholder = usePlaceholder("Texto da mensagem");
    const actionRedirectPlaceholder = usePlaceholder("URL");
    const rulesJsonPlaceholder = usePlaceholder('[\n  {\n    "id": "rule1",\n    "priority": 1,\n    "logic": "AND",\n    "conditions": [\n      {\n        "type": "answer",\n        "source": "stepId",\n        "operator": "==",\n        "value": "opcao1"\n      }\n    ],\n    "actions": [\n      {\n        "type": "goto",\n        "target": "nextStepId"\n      }\n    ]\n  }\n]');

    // Helper function to convert absolute URL to relative path when from API
    const normalizeImageUrl = (url: string | null): string => {
        if (!url) return '';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
        if (url.startsWith(`${apiUrl}/uploads/`)) {
            return url.replace(`${apiUrl}/uploads/`, '/uploads/');
        }
        return url;
    };

    useEffect(() => {
        if (stepId) {
            setLoading(true);
            apiFetch<StepDetail>(`/steps/${stepId}`, { token: token! })
                .then((data) => {
                    // Normalize image_url when loading from backend
                    if (data.image_url) {
                        data.image_url = normalizeImageUrl(data.image_url) || data.image_url;
                    }
                    setStep(data);
                })
                .finally(() => setLoading(false));
        }
    }, [stepId, token]);

    // Buscar steps do quiz
    useEffect(() => {
        if (quizId && token) {
            apiFetch<StepList[]>(`/steps?quizId=${quizId}`, { token })
                .then(setQuizSteps)
                .catch(console.error);
        }
    }, [quizId, token]);

    const handleImageUpload = async (file: File) => {
        if (!token) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"}/uploads/image`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            // Normalize URL to use relative path for Next.js Image optimization
            const normalizedUrl = normalizeImageUrl(data.url);
            setStep({ ...step!, image_url: normalizedUrl || data.url });
        } catch (error) {
            console.error("Upload error:", error);
            alert("Falha ao fazer upload da imagem");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setStep({ ...step!, image_url: null });
    };

    const handleSave = async () => {
        // Validar regras antes de salvar
        const rules = (step!.metadata as any)?.rules || [];
        if (Array.isArray(rules) && rules.length > 0) {
            const errors: string[] = [];
            
            rules.forEach((rule: any, ruleIndex: number) => {
                // Validar condições
                if (rule.conditions && Array.isArray(rule.conditions)) {
                    rule.conditions.forEach((condition: any, condIndex: number) => {
                        if (!condition.type || (condition.type !== 'answer' && condition.type !== 'variable')) {
                            errors.push(`Regra ${ruleIndex + 1}, Condição ${condIndex + 1}: Tipo inválido (deve ser 'answer' ou 'variable')`);
                        }
                        if (!condition.source || condition.source.trim() === '') {
                            errors.push(`Regra ${ruleIndex + 1}, Condição ${condIndex + 1}: Source não pode estar vazio`);
                        }
                        if (!condition.operator) {
                            errors.push(`Regra ${ruleIndex + 1}, Condição ${condIndex + 1}: Operador não pode estar vazio`);
                        }
                        if (condition.value === undefined || condition.value === null) {
                            errors.push(`Regra ${ruleIndex + 1}, Condição ${condIndex + 1}: Valor não pode estar vazio`);
                        }
                    });
                }
                
                // Validar ações
                if (rule.actions && Array.isArray(rule.actions)) {
                    rule.actions.forEach((action: any, actionIndex: number) => {
                        if (!action.type) {
                            errors.push(`Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: Tipo não pode estar vazio`);
                        }
                        
                        // Validar campos específicos por tipo de ação
                        if (action.type === 'goto' || action.type === 'setVariable') {
                            if (!action.target || action.target.trim() === '') {
                                errors.push(`Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: ${action.type === 'goto' ? 'Step ID' : 'Nome da variável'} não pode estar vazio`);
                            }
                        }
                        if (action.type === 'skip' && !action.value && !action.target) {
                            errors.push(`Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: Valor ou target necessário para skip`);
                        }
                        if (action.type === 'score' && (typeof action.value !== 'number')) {
                            errors.push(`Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: Valor deve ser um número para score`);
                        }
                        if (action.type === 'message' && (!action.value || typeof action.value !== 'string')) {
                            errors.push(`Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: Mensagem não pode estar vazia`);
                        }
                        if (action.type === 'redirect' && (!action.value || typeof action.value !== 'string')) {
                            errors.push(`Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: URL de redirecionamento não pode estar vazia`);
                        }
                    });
                }
            });
            
            if (errors.length > 0) {
                alert(`Erros de validação nas regras:\n\n${errors.join('\n')}\n\nPor favor, corrija antes de salvar.`);
                setSaving(false);
                return;
            }
        }
        
        setSaving(true);

        try {
            const payload: any = {
                title: step!.title,
                description: step!.description,
                image_url: step!.image_url || undefined,
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
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Falha ao salvar");
        } finally {
            setSaving(false);
        }
    };

    // Expor função save via ref
    useImperativeHandle(ref, () => ({
        save: handleSave,
    }), [step, stepId, token, onUpdate]);

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

                {/* Campo de upload de imagem principal */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Imagem Principal (Opcional)</label>
                    {step.image_url ? (
                        <div className="relative">
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                                <Image
                                    src={normalizeImageUrl(step.image_url)}
                                    alt="Imagem do step"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveImage}
                                className="mt-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Remover Imagem
                            </Button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file);
                                }}
                                className="hidden"
                                id="step-image-upload"
                                disabled={uploadingImage}
                            />
                            <label
                                htmlFor="step-image-upload"
                                className="cursor-pointer flex flex-col items-center gap-2"
                            >
                                {uploadingImage ? (
                                    <>
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        <span className="text-sm text-gray-600">Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <span className="text-sm text-gray-600">Clique para fazer upload de uma imagem</span>
                                        <span className="text-xs text-gray-400">PNG, JPG, GIF ou WebP (máx. 5MB)</span>
                                    </>
                                )}
                            </label>
                        </div>
                    )}
                    <p className="text-xs text-gray-500">
                        Esta imagem será exibida como imagem principal do step (diferente das imagens inseridas no texto)
                    </p>
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
                                        : step.type === "INPUT"
                                            ? "Adicione uma descrição ou instrução para o campo de input..."
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
                                        placeholder={optionPlaceholder.placeholder}
                                        value={opt.text}
                                        onChange={(e) => {
                                            const newOpts = [...step.question!.options];
                                            newOpts[idx].text = e.target.value;
                                            newOpts[idx].value = e.target.value;
                                            setStep({ ...step, question: { ...step.question!, options: newOpts } });
                                        }}
                                        onFocus={optionPlaceholder.onFocus}
                                        onBlur={optionPlaceholder.onBlur}
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

                        {/* Configuração de Múltipla Escolha */}
                        <div className="mt-6 pt-6 border-t border-primary-200 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-primary-600" />
                                <h3 className="font-semibold text-primary-900">Configurações de Resposta</h3>
                            </div>
                            
                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-300 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={(step.metadata?.multipleChoice as boolean) || false}
                                    onChange={(e) => {
                                        const currentMetadata = step.metadata || {};
                                        setStep({
                                            ...step,
                                            metadata: {
                                                ...currentMetadata,
                                                multipleChoice: e.target.checked,
                                                // Reset limits when disabling multiple choice
                                                ...(e.target.checked ? {} : { minSelections: undefined, maxSelections: undefined }),
                                            },
                                        });
                                    }}
                                    className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <span className="font-medium text-gray-900">Permitir múltiplas escolhas</span>
                            </label>

                            {(step.metadata?.multipleChoice as boolean) && (
                                <div className="bg-white rounded-lg border-2 border-primary-200 p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Mínimo de seleções</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={(step.metadata?.minSelections as number) || 1}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseInt(e.target.value, 10) : 1;
                                                    const currentMetadata = step.metadata || {};
                                                    setStep({
                                                        ...step,
                                                        metadata: {
                                                            ...currentMetadata,
                                                            minSelections: value,
                                                        },
                                                    });
                                                }}
                                                onFocus={minScorePlaceholder.onFocus}
                                                onBlur={minScorePlaceholder.onBlur}
                                                placeholder={minScorePlaceholder.placeholder}
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Máximo de seleções</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={(step.metadata?.maxSelections as number | null) ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseInt(e.target.value, 10) : null;
                                                    const currentMetadata = step.metadata || {};
                                                    setStep({
                                                        ...step,
                                                        metadata: {
                                                            ...currentMetadata,
                                                            maxSelections: value,
                                                        },
                                                    });
                                                }}
                                                className="bg-white"
                                                placeholder="Sem limite"
                                            />
                                            <p className="text-xs text-gray-500">Deixe vazio para sem limite</p>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                {step.type === "INPUT" && (
                    <div className="rounded-xl border-2 border-info-100 bg-info-50 p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-info-600" />
                            <h3 className="font-semibold text-info-900">Configuração de Campo de Input</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Configure o campo de input que será usado para capturar uma variável dinâmica.
                        </p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Nome da Variável</label>
                                <Input
                                    value={step.metadata?.variableName || ""}
                                    onChange={(e) => setStep({
                                        ...step,
                                        metadata: { ...step.metadata, variableName: e.target.value }
                                    })}
                                    onFocus={variableNamePlaceholder.onFocus}
                                    onBlur={variableNamePlaceholder.onBlur}
                                    placeholder={variableNamePlaceholder.placeholder}
                                    className="bg-white"
                                />
                                <p className="text-xs text-gray-500">
                                    Nome da variável que será armazenada (sem espaços, apenas letras minúsculas e números). 
                                    Pode ser usado em textos com {"{{variável}}"}.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Tipo de Input</label>
                                <select
                                    value={step.metadata?.inputType || "text"}
                                    onChange={(e) => setStep({
                                        ...step,
                                        metadata: { ...step.metadata, inputType: e.target.value as 'text' | 'number' | 'email' }
                                    })}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-primary-500"
                                >
                                    <option value="text">Texto</option>
                                    <option value="number">Número</option>
                                    <option value="email">E-mail</option>
                                </select>
                                <p className="text-xs text-gray-500">
                                    Tipo de campo que será exibido para o usuário.
                                </p>
                            </div>
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
                                onFocus={ctaLinkPlaceholder.onFocus}
                                onBlur={ctaLinkPlaceholder.onBlur}
                                placeholder={ctaLinkPlaceholder.placeholder}
                                className="bg-white"
                            />
                            <p className="text-xs text-gray-500">
                                Se preenchido, um botão será exibido no final do quiz levando para este link.
                            </p>
                        </div>
                    </div>
                )}

                {/* Editor de Regras Condicionais - para todos os steps */}
                <div className="mt-6 pt-6 border-t border-primary-200 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary-600" />
                            <h3 className="font-semibold text-primary-900">Regras Condicionais</h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setRulesEditMode('visual')}
                                className={`px-3 py-1 text-sm rounded ${rulesEditMode === 'visual' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <Edit className="h-4 w-4 inline mr-1" />
                                Visual
                            </button>
                            <button
                                type="button"
                                onClick={() => setRulesEditMode('json')}
                                className={`px-3 py-1 text-sm rounded ${rulesEditMode === 'json' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <Code className="h-4 w-4 inline mr-1" />
                                JSON
                            </button>
                        </div>
                    </div>
                    
                    {rulesEditMode === 'visual' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Configure regras que determinam o próximo step baseado em respostas e variáveis.
                            </p>
                            {((step.metadata as any)?.rules || []).length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                    <p className="text-gray-500 mb-4">Nenhuma regra configurada</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentMetadata = step.metadata || {};
                                            const currentRules = (currentMetadata as any).rules || [];
                                            const newRule = {
                                                id: `rule-${Date.now()}`,
                                                priority: currentRules.length + 1,
                                                logic: 'AND' as const,
                                                conditions: [],
                                                actions: [],
                                            };
                                            setStep({
                                                ...step,
                                                metadata: {
                                                    ...currentMetadata,
                                                    rules: [...currentRules, newRule],
                                                },
                                            });
                                        }}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 mx-auto"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Adicionar Regra
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {((step.metadata as any)?.rules || []).map((rule: any, ruleIndex: number) => {
                                        // Encontrar step selecionado para condições
                                        const getSourceStep = (condition: any) => {
                                            if (condition.type === 'answer' && condition.source) {
                                                // Se for o step atual, usar os dados do step
                                                if (condition.source === step.id && step) {
                                                    return {
                                                        id: step.id,
                                                        title: step.title,
                                                        type: step.type,
                                                        question: step.question ? {
                                                            options: step.question.options || []
                                                        } : undefined
                                                    };
                                                }
                                                // Caso contrário, buscar nos quizSteps
                                                return quizSteps.find(s => s.id === condition.source);
                                            }
                                            return null;
                                        };

                                        return (
                                            <div key={rule.id || ruleIndex} className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-semibold text-gray-800">Regra {ruleIndex + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentMetadata = step.metadata || {};
                                                            const currentRules = (currentMetadata as any).rules || [];
                                                            const newRules = currentRules.filter((r: any, i: number) => i !== ruleIndex);
                                                            setStep({
                                                                ...step,
                                                                metadata: {
                                                                    ...currentMetadata,
                                                                    rules: newRules,
                                                                },
                                                            });
                                                        }}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                
                                                {/* Condições */}
                                                <div className="mb-4">
                                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Condições</label>
                                                    <div className="space-y-2">
                                                        {rule.conditions?.length === 0 && (
                                                            <p className="text-xs text-gray-500 italic">Nenhuma condição</p>
                                                        )}
                                                        {rule.conditions?.map((condition: any, condIndex: number) => {
                                                            const sourceStep = getSourceStep(condition);
                                                            const shouldShowValueDropdown = sourceStep?.type === 'QUESTION' && sourceStep?.question?.options && sourceStep.question.options.length > 0;

                                                            return (
                                                                <div key={condIndex} className="flex gap-2 items-start p-2 bg-gray-50 rounded">
                                                                    <select
                                                                        value={condition.type || 'answer'}
                                                                        onChange={(e) => {
                                                                            const currentMetadata = step.metadata || {};
                                                                            const currentRules = (currentMetadata as any).rules || [];
                                                                            const newRules = [...currentRules];
                                                                            newRules[ruleIndex] = {
                                                                                ...newRules[ruleIndex],
                                                                                conditions: newRules[ruleIndex].conditions.map((c: any, i: number) => 
                                                                                    i === condIndex ? { ...c, type: e.target.value, source: '', value: '' } : c
                                                                                ),
                                                                            };
                                                                            setStep({
                                                                                ...step,
                                                                                metadata: { ...currentMetadata, rules: newRules },
                                                                            });
                                                                        }}
                                                                        className="px-2 py-1 border rounded text-sm"
                                                                    >
                                                                        <option value="answer">Resposta</option>
                                                                        <option value="variable">Variável</option>
                                                                    </select>
                                                                    {condition.type === 'answer' ? (
                                                                        <select
                                                                            value={condition.source || ''}
                                                                            onChange={(e) => {
                                                                                const currentMetadata = step.metadata || {};
                                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                                const newRules = [...currentRules];
                                                                                newRules[ruleIndex] = {
                                                                                    ...newRules[ruleIndex],
                                                                                    conditions: newRules[ruleIndex].conditions.map((c: any, i: number) => 
                                                                                        i === condIndex ? { ...c, source: e.target.value, value: '' } : c
                                                                                    ),
                                                                                };
                                                                                setStep({
                                                                                    ...step,
                                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                                });
                                                                            }}
                                                                            className="flex-1 px-2 py-1 border rounded text-sm"
                                                                        >
                                                                            <option value="">Selecione um step</option>
                                                                            {/* Step atual */}
                                                                            {step && (
                                                                                <option key={step.id} value={step.id}>
                                                                                    {step.title} ({step.type}) - Este step
                                                                                </option>
                                                                            )}
                                                                            {/* Outros steps */}
                                                                            {quizSteps
                                                                                .filter(s => s.id !== step.id)
                                                                                .map(s => (
                                                                                    <option key={s.id} value={s.id}>
                                                                                        {s.title} ({s.type})
                                                                                    </option>
                                                                                ))}
                                                                        </select>
                                                                    ) : (
                                                                        <Input
                                                                            placeholder={conditionVariablePlaceholder.placeholder}
                                                                            value={condition.source || ''}
                                                                            onFocus={conditionVariablePlaceholder.onFocus}
                                                                            onBlur={conditionVariablePlaceholder.onBlur}
                                                                            onChange={(e) => {
                                                                                const currentMetadata = step.metadata || {};
                                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                                const newRules = [...currentRules];
                                                                                newRules[ruleIndex] = {
                                                                                    ...newRules[ruleIndex],
                                                                                    conditions: newRules[ruleIndex].conditions.map((c: any, i: number) => 
                                                                                        i === condIndex ? { ...c, source: e.target.value } : c
                                                                                    ),
                                                                                };
                                                                                setStep({
                                                                                    ...step,
                                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                                });
                                                                            }}
                                                                            className="flex-1 text-sm"
                                                                        />
                                                                    )}
                                                                    <select
                                                                        value={condition.operator || '=='}
                                                                        onChange={(e) => {
                                                                            const currentMetadata = step.metadata || {};
                                                                            const currentRules = (currentMetadata as any).rules || [];
                                                                            const newRules = [...currentRules];
                                                                            newRules[ruleIndex] = {
                                                                                ...newRules[ruleIndex],
                                                                                conditions: newRules[ruleIndex].conditions.map((c: any, i: number) => 
                                                                                    i === condIndex ? { ...c, operator: e.target.value } : c
                                                                                ),
                                                                            };
                                                                            setStep({
                                                                                ...step,
                                                                                metadata: { ...currentMetadata, rules: newRules },
                                                                            });
                                                                        }}
                                                                        className="px-2 py-1 border rounded text-sm"
                                                                    >
                                                                        <option value="==">=</option>
                                                                        <option value="!=">≠</option>
                                                                        <option value=">">&gt;</option>
                                                                        <option value="<">&lt;</option>
                                                                        <option value=">=">≥</option>
                                                                        <option value="<=">≤</option>
                                                                        <option value="in">contém</option>
                                                                        <option value="notIn">não contém</option>
                                                                    </select>
                                                                    {shouldShowValueDropdown ? (
                                                                        <select
                                                                            value={typeof condition.value === 'string' ? condition.value : ''}
                                                                            onChange={(e) => {
                                                                                const currentMetadata = step.metadata || {};
                                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                                const newRules = [...currentRules];
                                                                                newRules[ruleIndex] = {
                                                                                    ...newRules[ruleIndex],
                                                                                    conditions: newRules[ruleIndex].conditions.map((c: any, i: number) => 
                                                                                        i === condIndex ? { ...c, value: e.target.value } : c
                                                                                    ),
                                                                                };
                                                                                setStep({
                                                                                    ...step,
                                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                                });
                                                                            }}
                                                                            className="flex-1 px-2 py-1 border rounded text-sm"
                                                                        >
                                                                            <option value="">Selecione um valor</option>
                                                                            {sourceStep?.question?.options?.map((opt: any) => (
                                                                                <option key={opt.value} value={opt.value}>
                                                                                    {opt.text} ({opt.value})
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        <Input
                                                                            placeholder={conditionValuePlaceholder.placeholder}
                                                                            value={typeof condition.value === 'string' ? condition.value : JSON.stringify(condition.value)}
                                                                            onFocus={conditionValuePlaceholder.onFocus}
                                                                            onBlur={conditionValuePlaceholder.onBlur}
                                                                            onChange={(e) => {
                                                                                const currentMetadata = step.metadata || {};
                                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                                const newRules = [...currentRules];
                                                                                let parsedValue: any = e.target.value;
                                                                                try {
                                                                                    parsedValue = JSON.parse(e.target.value);
                                                                                } catch {
                                                                                    // Manter como string
                                                                                }
                                                                                newRules[ruleIndex] = {
                                                                                    ...newRules[ruleIndex],
                                                                                    conditions: newRules[ruleIndex].conditions.map((c: any, i: number) => 
                                                                                        i === condIndex ? { ...c, value: parsedValue } : c
                                                                                    ),
                                                                                };
                                                                                setStep({
                                                                                    ...step,
                                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                                });
                                                                            }}
                                                                            className="flex-1 text-sm"
                                                                        />
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const currentMetadata = step.metadata || {};
                                                                            const currentRules = (currentMetadata as any).rules || [];
                                                                            const newRules = [...currentRules];
                                                                            newRules[ruleIndex] = {
                                                                                ...newRules[ruleIndex],
                                                                                conditions: newRules[ruleIndex].conditions.filter((c: any, i: number) => i !== condIndex),
                                                                            };
                                                                            setStep({
                                                                                ...step,
                                                                                metadata: { ...currentMetadata, rules: newRules },
                                                                            });
                                                                        }}
                                                                        className="text-red-600 hover:text-red-800"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const currentMetadata = step.metadata || {};
                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                const newRules = [...currentRules];
                                                                newRules[ruleIndex] = {
                                                                    ...newRules[ruleIndex],
                                                                    conditions: [...(newRules[ruleIndex].conditions || []), {
                                                                        type: 'answer',
                                                                        source: '',
                                                                        operator: '==',
                                                                        value: '',
                                                                    }],
                                                                };
                                                                setStep({
                                                                    ...step,
                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                });
                                                            }}
                                                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Adicionar Condição
                                                        </button>
                                                    </div>
                                                    {rule.conditions?.length > 1 && (
                                                        <div className="mt-2">
                                                            <label className="text-xs text-gray-600 mr-2">Lógica:</label>
                                                            <select
                                                                value={rule.logic || 'AND'}
                                                                onChange={(e) => {
                                                                    const currentMetadata = step.metadata || {};
                                                                    const currentRules = (currentMetadata as any).rules || [];
                                                                    const newRules = [...currentRules];
                                                                    newRules[ruleIndex] = { ...newRules[ruleIndex], logic: e.target.value };
                                                                    setStep({
                                                                        ...step,
                                                                        metadata: { ...currentMetadata, rules: newRules },
                                                                    });
                                                                }}
                                                                className="px-2 py-1 border rounded text-sm"
                                                            >
                                                                <option value="AND">E (AND)</option>
                                                                <option value="OR">OU (OR)</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Ações */}
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Ações</label>
                                                    <div className="space-y-2">
                                                        {rule.actions?.length === 0 && (
                                                            <p className="text-xs text-gray-500 italic">Nenhuma ação</p>
                                                        )}
                                                        {rule.actions?.map((action: any, actionIndex: number) => (
                                                            <div key={actionIndex} className="flex gap-2 items-start p-2 bg-gray-50 rounded">
                                                                <select
                                                                    value={action.type || 'goto'}
                                                                    onChange={(e) => {
                                                                        const currentMetadata = step.metadata || {};
                                                                        const currentRules = (currentMetadata as any).rules || [];
                                                                        const newRules = [...currentRules];
                                                                        newRules[ruleIndex] = {
                                                                            ...newRules[ruleIndex],
                                                                            actions: newRules[ruleIndex].actions.map((a: any, i: number) => 
                                                                                i === actionIndex ? { ...a, type: e.target.value, target: undefined, value: undefined } : a
                                                                            ),
                                                                        };
                                                                        setStep({
                                                                            ...step,
                                                                            metadata: { ...currentMetadata, rules: newRules },
                                                                        });
                                                                    }}
                                                                    className="px-2 py-1 border rounded text-sm"
                                                                >
                                                                    <option value="goto">Ir para Step</option>
                                                                    <option value="skip">Pular Steps</option>
                                                                    <option value="score">Pontuação</option>
                                                                    <option value="setVariable">Definir Variável</option>
                                                                    <option value="message">Mensagem</option>
                                                                    <option value="redirect">Redirecionar</option>
                                                                    <option value="end">Encerrar Quiz</option>
                                                                </select>
                                                                {action.type === 'goto' ? (
                                                                    <select
                                                                        value={action.target || ''}
                                                                        onChange={(e) => {
                                                                            const currentMetadata = step.metadata || {};
                                                                            const currentRules = (currentMetadata as any).rules || [];
                                                                            const newRules = [...currentRules];
                                                                            newRules[ruleIndex] = {
                                                                                ...newRules[ruleIndex],
                                                                                actions: newRules[ruleIndex].actions.map((a: any, i: number) => 
                                                                                    i === actionIndex ? { ...a, target: e.target.value } : a
                                                                                ),
                                                                            };
                                                                            setStep({
                                                                                ...step,
                                                                                metadata: { ...currentMetadata, rules: newRules },
                                                                            });
                                                                        }}
                                                                        className="flex-1 px-2 py-1 border rounded text-sm"
                                                                    >
                                                                        <option value="">Selecione um step</option>
                                                                        {quizSteps
                                                                            .filter(s => s.id !== step.id)
                                                                            .map(s => (
                                                                                <option key={s.id} value={s.id}>
                                                                                    {s.title} ({s.type})
                                                                                </option>
                                                                            ))}
                                                                    </select>
                                                                ) : action.type === 'skip' ? (
                                                                    <div className="flex gap-2 flex-1">
                                                                        <select
                                                                            value={typeof action.value === 'string' && quizSteps.some(s => s.id === action.value) ? action.value : ''}
                                                                            onChange={(e) => {
                                                                                const currentMetadata = step.metadata || {};
                                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                                const newRules = [...currentRules];
                                                                                newRules[ruleIndex] = {
                                                                                    ...newRules[ruleIndex],
                                                                                    actions: newRules[ruleIndex].actions.map((a: any, i: number) => 
                                                                                        i === actionIndex ? { ...a, value: e.target.value } : a
                                                                                    ),
                                                                                };
                                                                                setStep({
                                                                                    ...step,
                                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                                });
                                                                            }}
                                                                            className="flex-1 px-2 py-1 border rounded text-sm"
                                                                        >
                                                                            <option value="">Selecione step</option>
                                                                            {quizSteps
                                                                                .filter(s => s.id !== step.id)
                                                                                .map(s => (
                                                                                    <option key={s.id} value={s.id}>
                                                                                        {s.title} ({s.type})
                                                                                    </option>
                                                                                ))}
                                                                        </select>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder={actionSkipPlaceholder.placeholder}
                                                                            value={typeof action.value === 'number' ? action.value : (typeof action.value === 'string' && !quizSteps.some(s => s.id === action.value) ? action.value : '')}
                                                                            onFocus={actionSkipPlaceholder.onFocus}
                                                                            onBlur={actionSkipPlaceholder.onBlur}
                                                                            onChange={(e) => {
                                                                                const currentMetadata = step.metadata || {};
                                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                                const newRules = [...currentRules];
                                                                                const numValue = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                                                                newRules[ruleIndex] = {
                                                                                    ...newRules[ruleIndex],
                                                                                    actions: newRules[ruleIndex].actions.map((a: any, i: number) => 
                                                                                        i === actionIndex ? { ...a, value: numValue } : a
                                                                                    ),
                                                                                };
                                                                                setStep({
                                                                                    ...step,
                                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                                });
                                                                            }}
                                                                            className="flex-1 text-sm"
                                                                        />
                                                                    </div>
                                                                ) : action.type === 'setVariable' ? (
                                                                    <>
                                                                        <Input
                                                                            placeholder={actionVariableNamePlaceholder.placeholder}
                                                                            value={action.target || ''}
                                                                            onFocus={actionVariableNamePlaceholder.onFocus}
                                                                            onBlur={actionVariableNamePlaceholder.onBlur}
                                                                            onChange={(e) => {
                                                                                const currentMetadata = step.metadata || {};
                                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                                const newRules = [...currentRules];
                                                                                newRules[ruleIndex] = {
                                                                                    ...newRules[ruleIndex],
                                                                                    actions: newRules[ruleIndex].actions.map((a: any, i: number) => 
                                                                                        i === actionIndex ? { ...a, target: e.target.value } : a
                                                                                    ),
                                                                                };
                                                                                setStep({
                                                                                    ...step,
                                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                                });
                                                                            }}
                                                                            className="flex-1 text-sm"
                                                                        />
                                                                        <Input
                                                                            placeholder={actionVariableValuePlaceholder.placeholder}
                                                                            value={typeof action.value === 'string' || typeof action.value === 'number' ? action.value : ''}
                                                                            onFocus={actionVariableValuePlaceholder.onFocus}
                                                                            onBlur={actionVariableValuePlaceholder.onBlur}
                                                                            onChange={(e) => {
                                                                                const currentMetadata = step.metadata || {};
                                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                                const newRules = [...currentRules];
                                                                                newRules[ruleIndex] = {
                                                                                    ...newRules[ruleIndex],
                                                                                    actions: newRules[ruleIndex].actions.map((a: any, i: number) => 
                                                                                        i === actionIndex ? { ...a, value: e.target.value } : a
                                                                                    ),
                                                                                };
                                                                                setStep({
                                                                                    ...step,
                                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                                });
                                                                            }}
                                                                            className="flex-1 text-sm"
                                                                        />
                                                                    </>
                                                                ) : (action.type === 'score' || action.type === 'message' || action.type === 'redirect') ? (
                                                                    <Input
                                                                        placeholder={
                                                                            action.type === 'score' ? actionScorePlaceholder.placeholder :
                                                                            action.type === 'message' ? actionMessagePlaceholder.placeholder :
                                                                            actionRedirectPlaceholder.placeholder
                                                                        }
                                                                        type={action.type === 'score' ? 'number' : 'text'}
                                                                        value={typeof action.value === 'string' || typeof action.value === 'number' ? action.value : ''}
                                                                        onFocus={
                                                                            action.type === 'score' ? actionScorePlaceholder.onFocus :
                                                                            action.type === 'message' ? actionMessagePlaceholder.onFocus :
                                                                            actionRedirectPlaceholder.onFocus
                                                                        }
                                                                        onBlur={
                                                                            action.type === 'score' ? actionScorePlaceholder.onBlur :
                                                                            action.type === 'message' ? actionMessagePlaceholder.onBlur :
                                                                            actionRedirectPlaceholder.onBlur
                                                                        }
                                                                        onChange={(e) => {
                                                                            const currentMetadata = step.metadata || {};
                                                                            const currentRules = (currentMetadata as any).rules || [];
                                                                            const newRules = [...currentRules];
                                                                            let value: any = e.target.value;
                                                                            if (action.type === 'score') {
                                                                                value = parseInt(value) || 0;
                                                                            }
                                                                            newRules[ruleIndex] = {
                                                                                ...newRules[ruleIndex],
                                                                                actions: newRules[ruleIndex].actions.map((a: any, i: number) => 
                                                                                    i === actionIndex ? { ...a, value } : a
                                                                                ),
                                                                            };
                                                                            setStep({
                                                                                ...step,
                                                                                metadata: { ...currentMetadata, rules: newRules },
                                                                            });
                                                                        }}
                                                                        className="flex-1 text-sm"
                                                                    />
                                                                ) : null}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const currentMetadata = step.metadata || {};
                                                                        const currentRules = (currentMetadata as any).rules || [];
                                                                        const newRules = [...currentRules];
                                                                        newRules[ruleIndex] = {
                                                                            ...newRules[ruleIndex],
                                                                            actions: newRules[ruleIndex].actions.filter((a: any, i: number) => i !== actionIndex),
                                                                        };
                                                                        setStep({
                                                                            ...step,
                                                                            metadata: { ...currentMetadata, rules: newRules },
                                                                        });
                                                                    }}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const currentMetadata = step.metadata || {};
                                                                const currentRules = (currentMetadata as any).rules || [];
                                                                const newRules = [...currentRules];
                                                                newRules[ruleIndex] = {
                                                                    ...newRules[ruleIndex],
                                                                    actions: [...(newRules[ruleIndex].actions || []), {
                                                                        type: 'goto',
                                                                        target: '',
                                                                    }],
                                                                };
                                                                setStep({
                                                                    ...step,
                                                                    metadata: { ...currentMetadata, rules: newRules },
                                                                });
                                                            }}
                                                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Adicionar Ação
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentMetadata = step.metadata || {};
                                            const currentRules = (currentMetadata as any).rules || [];
                                            const newRule = {
                                                id: `rule-${Date.now()}`,
                                                priority: currentRules.length + 1,
                                                logic: 'AND' as const,
                                                conditions: [],
                                                actions: [],
                                            };
                                            setStep({
                                                ...step,
                                                metadata: {
                                                    ...currentMetadata,
                                                    rules: [...currentRules, newRule],
                                                },
                                            });
                                        }}
                                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Adicionar Regra
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Regras (JSON)</label>
                            <textarea
                                value={JSON.stringify((step.metadata as any)?.rules || [], null, 2)}
                                onChange={(e) => {
                                    try {
                                        const rules = JSON.parse(e.target.value);
                                        setRulesJsonError(null);
                                        const currentMetadata = step.metadata || {};
                                        setStep({
                                            ...step,
                                            metadata: {
                                                ...currentMetadata,
                                                rules: rules,
                                            },
                                        });
                                    } catch (err: any) {
                                        setRulesJsonError(err.message || 'JSON inválido');
                                    }
                                }}
                                className={`w-full px-3 py-2 border-2 rounded-lg bg-white font-mono text-sm focus:outline-none focus:border-primary-500 ${rulesJsonError ? 'border-red-300' : 'border-gray-200'}`}
                                rows={15}
                                placeholder={rulesJsonPlaceholder.placeholder}
                                onFocus={rulesJsonPlaceholder.onFocus}
                                onBlur={rulesJsonPlaceholder.onBlur}
                            />
                            {rulesJsonError && (
                                <p className="text-xs text-red-600">Erro: {rulesJsonError}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Formato: array de regras. Cada regra tem conditions (array) e actions (array).
                                Operadores: ==, !=, &gt;, &lt;, &gt;=, &lt;=, in, notIn.
                                Tipos de ação: goto, skip, score, setVariable, message, redirect, end.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

StepEditor.displayName = "StepEditor";

export default StepEditor;
