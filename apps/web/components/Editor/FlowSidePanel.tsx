"use client";

import React, { useRef } from "react";
import { X, MessageSquare, FileText, UserPlus, Trophy, Type, Save } from "lucide-react";
import { Button, Card, CardContent } from "@repo/ui";
import { StepType, StepDetail } from "./types/flow.types";
import StepEditor, { StepEditorRef } from "./StepEditor";

interface FlowSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedStepId: string | null;
    quizId: string;
    onStepUpdate?: (step: any) => void;
    onAddStep?: (type: StepType) => void;
}

const STEP_TYPES: Array<{ type: StepType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { type: "QUESTION", label: "Pergunta", icon: MessageSquare },
    { type: "TEXT", label: "Texto", icon: FileText },
    { type: "CAPTURE", label: "Captura", icon: UserPlus },
    { type: "INPUT", label: "Input", icon: Type },
    { type: "RESULT", label: "Resultado", icon: Trophy },
];

export function FlowSidePanel({
    isOpen,
    onClose,
    selectedStepId,
    quizId,
    onStepUpdate,
    onAddStep,
}: FlowSidePanelProps) {
    const stepEditorRef = useRef<StepEditorRef>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (stepEditorRef.current) {
            await stepEditorRef.current.save();
        }
    };

    return (
        <div className="absolute top-0 right-0 h-full w-[700px] bg-white border-l border-gray-200 shadow-xl z-10 flex flex-col">
            {/* Header fixo */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-20 flex-shrink-0">
                <h3 className="font-bold text-gray-900">Editor</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedStepId ? (
                    // Editor do step selecionado
                    <StepEditor
                        ref={stepEditorRef}
                        stepId={selectedStepId}
                        quizId={quizId}
                        onUpdate={(step) => {
                            onStepUpdate?.(step);
                        }}
                    />
                ) : (
                    // Painel de adicionar steps
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Adicionar Step</h4>
                            <div className="space-y-2">
                                {STEP_TYPES.map(({ type, label, icon: Icon }) => (
                                    <Button
                                        key={type}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onAddStep?.(type)}
                                        className="w-full justify-start"
                                    >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Botão salvar fixo no canto inferior direito */}
            {selectedStepId && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex-shrink-0 z-20 flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        variant="primary"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                    </Button>
                </div>
            )}
        </div>
    );
}

export default FlowSidePanel;
