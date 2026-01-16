"use client";

import React, { useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from "@xyflow/react";
import { FlowEdgeData } from "../types/flow.types";

/**
 * Edge customizada para conexões de referência (condições que referenciam outros steps)
 * Visual: cinza claro, tracejado mais espaçado, com tooltip no hover
 */
export function ReferenceEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) {
    const edgeData = data as FlowEdgeData | undefined;
    const [isHovered, setIsHovered] = useState(false);
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const hasErrors = edgeData?.validationErrors ? Array.isArray(edgeData.validationErrors) && edgeData.validationErrors.length > 0 : false;
    const edgeColor = hasErrors ? "#ef4444" : "#9ca3af"; // vermelho se erro, cinza claro normal

    // Formatar informações da condição para o tooltip
    const getTooltipContent = () => {
        if (!edgeData) return "";
        
        const parts: string[] = [];
        
        if (edgeData.conditionType) {
            parts.push(`Tipo: ${edgeData.conditionType === "answer" ? "Resposta" : "Variável"}`);
        }
        
        if (edgeData.conditionSource) {
            if (edgeData.conditionType === "answer") {
                // Para condições do tipo answer, mostrar título do step se disponível
                const stepLabel = edgeData.referencedStepTitle 
                    ? `Step: ${edgeData.referencedStepTitle}` 
                    : `Step ID: ${edgeData.conditionSource}`;
                parts.push(stepLabel);
            } else {
                parts.push(`Variável: ${edgeData.conditionSource}`);
            }
        }
        
        if (edgeData.conditionOperator) {
            const operatorSymbol = getOperatorSymbol(edgeData.conditionOperator);
            parts.push(`Operador: ${operatorSymbol}`);
        }
        
        if (edgeData.conditionValue !== undefined) {
            const valueStr = typeof edgeData.conditionValue === "object" 
                ? JSON.stringify(edgeData.conditionValue) 
                : String(edgeData.conditionValue);
            parts.push(`Valor: ${valueStr}`);
        }
        
        return parts.join("\n");
    };

    const tooltipContent = getTooltipContent();

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: edgeColor,
                    strokeWidth: 1.5,
                    strokeDasharray: "8,4",
                    opacity: isHovered ? 0.8 : 0.6,
                    transition: "opacity 0.2s",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
            {isHovered && tooltipContent && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: "all",
                            marginBottom: 8,
                        }}
                        className="nodrag nopan"
                    >
                        <div
                            className="px-3 py-2 bg-gray-800 text-white rounded shadow-lg border border-gray-700 whitespace-pre-line text-xs max-w-xs z-50"
                            style={{ 
                                whiteSpace: "pre-line",
                                lineHeight: "1.4",
                            }}
                        >
                            {tooltipContent}
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

/**
 * Converte operador para símbolo
 */
function getOperatorSymbol(operator: string): string {
    const symbols: Record<string, string> = {
        "==": "=",
        "!=": "≠",
        ">": ">",
        "<": "<",
        ">=": "≥",
        "<=": "≤",
        in: "∈",
        notIn: "∉",
    };
    return symbols[operator] || operator;
}

export default ReferenceEdge;
