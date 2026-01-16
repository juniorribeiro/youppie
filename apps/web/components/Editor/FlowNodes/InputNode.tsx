"use client";

import React from "react";
import { NodeProps } from "@xyflow/react";
import { FlowNodeData } from "../types/flow.types";
import BaseNode from "./BaseNode";

export function InputNode(props: NodeProps) {
    const { data, selected } = props;
    const nodeData = data as unknown as FlowNodeData;
    const variableName = nodeData.step.metadata?.variableName;
    const inputType = nodeData.step.metadata?.inputType || "text";

    return (
        <BaseNode data={nodeData} selected={selected}>
            <div className="text-xs text-gray-600">
                {variableName && `Variável: ${variableName}`}
                {variableName && " • "}
                Tipo: {inputType}
            </div>
        </BaseNode>
    );
}

export default InputNode;
