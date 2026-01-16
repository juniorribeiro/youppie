"use client";

import React from "react";
import { NodeProps } from "@xyflow/react";
import { FlowNodeData } from "../types/flow.types";
import BaseNode from "./BaseNode";

export function ResultNode(props: NodeProps) {
    const { data, selected } = props;
    const nodeData = data as unknown as FlowNodeData;
    const ctaText = nodeData.step.metadata?.cta_text;

    return (
        <BaseNode data={nodeData} selected={selected}>
            {ctaText && (
                <div className="text-xs text-gray-600">
                    CTA: {ctaText}
                </div>
            )}
        </BaseNode>
    );
}

export default ResultNode;
