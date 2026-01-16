"use client";

import React from "react";
import { NodeProps } from "@xyflow/react";
import { FlowNodeData } from "../types/flow.types";
import BaseNode from "./BaseNode";

export function QuestionNode(props: NodeProps) {
    const { data, selected } = props;
    const nodeData = data as unknown as FlowNodeData;
    return (
        <BaseNode data={nodeData} selected={selected}>
            <div className="text-xs text-gray-600">
                {nodeData.step.question?.options?.length || 0} opções
            </div>
        </BaseNode>
    );
}

export default QuestionNode;
