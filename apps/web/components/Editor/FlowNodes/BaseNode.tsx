"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { FlowNodeData, StepType } from "../types/flow.types";
import { MessageSquare, FileText, UserPlus, Trophy, Type, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@repo/ui";

const STEP_ICONS: Record<StepType, React.ComponentType<{ className?: string }>> = {
    QUESTION: MessageSquare,
    TEXT: FileText,
    CAPTURE: UserPlus,
    RESULT: Trophy,
    INPUT: Type,
};

const STEP_COLORS: Record<StepType, string> = {
    QUESTION: "bg-primary-50 border-primary-300 text-primary-700",
    TEXT: "bg-purple-50 border-purple-300 text-purple-700",
    CAPTURE: "bg-success-50 border-success-300 text-success-700",
    RESULT: "bg-warning-50 border-warning-300 text-warning-700",
    INPUT: "bg-info-50 border-info-300 text-info-700",
};

const STEP_LABELS: Record<StepType, string> = {
    QUESTION: "Pergunta",
    TEXT: "Texto",
    CAPTURE: "Captura",
    RESULT: "Resultado",
    INPUT: "Input",
};

interface BaseNodeProps {
    data: FlowNodeData & { onDelete?: () => void };
    selected?: boolean;
    children?: React.ReactNode;
}

/**
 * Componente base compartilhado para todos os nodes do flow
 */
export function BaseNode({ data, selected, children }: BaseNodeProps) {
    const { step, hasRules, validationErrors, onDelete } = data;
    const Icon = STEP_ICONS[step.type];
    const hasErrors = validationErrors && validationErrors.length > 0;

    return (
        <div
            className={cn(
                "rounded-lg border-2 shadow-md transition-all min-w-[200px]",
                STEP_COLORS[step.type],
                selected && "ring-2 ring-primary-500 ring-offset-2",
                hasErrors && "border-danger-500",
                !selected && !hasErrors && "border-gray-300"
            )}
        >
            {/* Handle de entrada */}
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-primary-500 !w-3 !h-3"
            />

            {/* Cabeçalho do node */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 relative">
                <div className={cn("p-2 rounded-lg", STEP_COLORS[step.type])}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{step.title}</div>
                    <div className="text-xs text-gray-500">{STEP_LABELS[step.type]}</div>
                </div>
                <div className="flex items-center gap-1">
                    {hasRules && (
                        <div className="w-2 h-2 rounded-full bg-primary-500" title="Tem regras" />
                    )}
                    {hasErrors && (
                        <div title="Erros de validação">
                            <AlertCircle className="h-4 w-4 text-danger-500" />
                        </div>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-1 rounded hover:bg-danger-100 text-gray-400 hover:text-danger-600 transition-colors"
                            title="Deletar step"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Conteúdo customizado (children) */}
            {children && <div className="p-3">{children}</div>}

            {/* Indicador de regras expandido (opcional) */}
            {hasRules && step.metadata?.rules && step.metadata.rules.length > 0 && (
                <div className="px-3 pb-2 text-xs text-gray-600">
                    {step.metadata.rules.length} regra{step.metadata.rules.length > 1 ? "s" : ""}
                </div>
            )}

            {/* Handle de saída */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-primary-500 !w-3 !h-3"
            />
        </div>
    );
}

export default BaseNode;
