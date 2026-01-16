"use client";

import React from "react";
import { NodeProps } from "@xyflow/react";
import { FlowNodeData } from "../types/flow.types";
import BaseNode from "./BaseNode";

export function CaptureNode(props: NodeProps) {
    const { data, selected } = props;
    const nodeData = data as unknown as FlowNodeData;
    const captureFields = nodeData.step.metadata?.captureFields || {};
    const fields = Object.entries(captureFields)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key);

    return (
        <BaseNode data={nodeData} selected={selected}>
            <div className="text-xs text-gray-600">
                Campos: {fields.length > 0 ? fields.join(", ") : "nenhum"}
            </div>
        </BaseNode>
    );
}

export default CaptureNode;
