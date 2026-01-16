"use client";

import React from "react";
import { NodeProps } from "@xyflow/react";
import { FlowNodeData } from "../types/flow.types";
import BaseNode from "./BaseNode";

export function TextNode(props: NodeProps) {
    const { data, selected } = props;
    const nodeData = data as unknown as FlowNodeData;
    const description = nodeData.step.description || "";
    const preview = description.replace(/<[^>]*>/g, "").substring(0, 50);

    return (
        <BaseNode data={nodeData} selected={selected}>
            {preview && (
                <div className="text-xs text-gray-600 truncate">
                    {preview}
                    {description.length > 50 && "..."}
                </div>
            )}
        </BaseNode>
    );
}

export default TextNode;
