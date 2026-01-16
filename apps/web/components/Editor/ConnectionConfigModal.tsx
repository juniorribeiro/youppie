"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@repo/ui";
import { StepDetail } from "./types/flow.types";

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

interface ConnectionConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceStepId: string;
    targetStepId: string;
    sourceStep: StepDetail | null;
    targetStep: StepDetail | null;
    allSteps: StepDetail[];
    onSave: (config: {
        type: "sequential" | "conditional";
        rule?: {
            id: string;
            priority: number;
            logic: "AND" | "OR";
            conditions: Array<{
                type: "answer" | "variable";
                source: string;
                operator: string;
                value: any;
            }>;
            actions: Array<{
                type: string;
                target?: string;
                value?: any;
            }>;
        };
    }) => void;
}

export default function ConnectionConfigModal({
    isOpen,
    onClose,
    sourceStepId,
    targetStepId,
    sourceStep,
    targetStep,
    allSteps,
    onSave,
}: ConnectionConfigModalProps) {
    const [connectionType, setConnectionType] = useState<"step" | "conditional">("step");
    const [conditionType, setConditionType] = useState<"answer" | "variable">("answer");
    const [conditionSource, setConditionSource] = useState<string>("");
    const [conditionOperator, setConditionOperator] = useState<string>("==");
    const [conditionValue, setConditionValue] = useState<string>("");
    
    // Placeholders dinâmicos
    const conditionValuePlaceholder = usePlaceholder("Digite o valor");
    const variableNamePlaceholder = usePlaceholder("Ex: nome, idade, peso");

    if (!isOpen) return null;

    const handleSave = () => {
        if (connectionType === "step") {
            // Conexão sequencial simples
            onSave({
                type: "sequential",
            });
        } else {
            // Conexão condicional - criar regra
            if (!conditionSource || !conditionValue) {
                alert("Preencha todos os campos da condição");
                return;
            }

            const rule = {
                id: `rule-${Date.now()}`,
                priority: 1,
                logic: "AND" as const,
                conditions: [
                    {
                        type: conditionType,
                        source: conditionSource,
                        operator: conditionOperator,
                        value: conditionValue,
                    },
                ],
                actions: [
                    {
                        type: "goto",
                        target: targetStepId,
                    },
                ],
            };

            onSave({
                type: "conditional",
                rule,
            });
        }
        onClose();
    };

    const selectedSourceStep = allSteps.find((s) => s.id === conditionSource);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <CardTitle>Configurar Ligação</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            De <strong>{sourceStep?.title || sourceStepId}</strong> para{" "}
                            <strong>{targetStep?.title || targetStepId}</strong>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                Tipo de Ligação
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConnectionType("step")}
                                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                                        connectionType === "step"
                                            ? "bg-primary-100 border-primary-500 text-primary-700"
                                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    Step Sequencial
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConnectionType("conditional")}
                                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                                        connectionType === "conditional"
                                            ? "bg-primary-100 border-primary-500 text-primary-700"
                                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    Condição
                                </button>
                            </div>
                        </div>

                        {connectionType === "conditional" && (
                            <div className="space-y-4 border-t pt-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                        Tipo de Condição
                                    </label>
                                    <select
                                        value={conditionType}
                                        onChange={(e) => {
                                            setConditionType(e.target.value as "answer" | "variable");
                                            setConditionSource("");
                                            setConditionValue("");
                                        }}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="answer">Resposta de Step</option>
                                        <option value="variable">Variável</option>
                                    </select>
                                </div>

                                {conditionType === "answer" ? (
                                    <>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                Step de Referência
                                            </label>
                                            <select
                                                value={conditionSource}
                                                onChange={(e) => {
                                                    setConditionSource(e.target.value);
                                                    setConditionValue("");
                                                }}
                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-primary-500"
                                            >
                                                <option value="">Selecione um step</option>
                                                {allSteps.map((step) => (
                                                    <option key={step.id} value={step.id}>
                                                        {step.title} ({step.type})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedSourceStep?.type === "QUESTION" &&
                                            selectedSourceStep?.question?.options && (
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                        Operador
                                                    </label>
                                                    <select
                                                        value={conditionOperator}
                                                        onChange={(e) => setConditionOperator(e.target.value)}
                                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-primary-500"
                                                    >
                                                        <option value="==">=</option>
                                                        <option value="!=">≠</option>
                                                        <option value="in">contém</option>
                                                        <option value="notIn">não contém</option>
                                                    </select>
                                                </div>
                                            )}

                                        {selectedSourceStep?.type === "QUESTION" &&
                                            selectedSourceStep?.question?.options ? (
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                    Valor (Opção)
                                                </label>
                                                <select
                                                    value={conditionValue}
                                                    onChange={(e) => setConditionValue(e.target.value)}
                                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-primary-500"
                                                >
                                                    <option value="">Selecione uma opção</option>
                                                    {selectedSourceStep.question.options.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.text} ({opt.value})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                        Operador
                                                    </label>
                                                    <select
                                                        value={conditionOperator}
                                                        onChange={(e) => setConditionOperator(e.target.value)}
                                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-primary-500"
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
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                        Valor
                                                    </label>
                                                    <Input
                                                        value={conditionValue}
                                                        onChange={(e) => setConditionValue(e.target.value)}
                                                        onFocus={conditionValuePlaceholder.onFocus}
                                                        onBlur={conditionValuePlaceholder.onBlur}
                                                        placeholder={conditionValuePlaceholder.placeholder}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                Nome da Variável
                                            </label>
                                            <Input
                                                value={conditionSource}
                                                onChange={(e) => setConditionSource(e.target.value)}
                                                onFocus={variableNamePlaceholder.onFocus}
                                                onBlur={variableNamePlaceholder.onBlur}
                                                placeholder={variableNamePlaceholder.placeholder}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                Operador
                                            </label>
                                            <select
                                                value={conditionOperator}
                                                onChange={(e) => setConditionOperator(e.target.value)}
                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-primary-500"
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
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                Valor
                                            </label>
                                            <Input
                                                value={conditionValue}
                                                onChange={(e) => setConditionValue(e.target.value)}
                                                onFocus={conditionValuePlaceholder.onFocus}
                                                onBlur={conditionValuePlaceholder.onBlur}
                                                placeholder={conditionValuePlaceholder.placeholder}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2 justify-end pt-4 border-t">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                Salvar Ligação
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
