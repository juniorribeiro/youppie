"use client";

import React from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from "@xyflow/react";
import { FlowEdgeData } from "../types/flow.types";

/**
 * Edge customizada para conexões condicionais (regras)
 * Visual: laranja, tracejada, com label opcional
 */
export function ConditionalEdge({
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
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const hasErrors = edgeData?.validationErrors ? Array.isArray(edgeData.validationErrors) && edgeData.validationErrors.length > 0 : false;
    const edgeColor = hasErrors ? "#ef4444" : "#f97316"; // vermelho se erro, laranja normal

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: edgeColor,
                    strokeWidth: 2,
                    strokeDasharray: "5,5",
                }}
            />
            {edgeData?.label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: "all",
                        }}
                        className="nodrag nopan"
                    >
                        <div
                            className="px-2 py-1 bg-orange-100 border border-orange-300 rounded text-orange-800 shadow-sm"
                            style={{ whiteSpace: "nowrap" }}
                        >
                            {edgeData.label}
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export default ConditionalEdge;
