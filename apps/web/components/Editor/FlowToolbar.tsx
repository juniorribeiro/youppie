"use client";

import React from "react";
import {
    Plus,
    ZoomIn,
    ZoomOut,
    Maximize2,
    X,
    AlertCircle,
    Download,
    MessageSquare,
    FileText,
    UserPlus,
    Trophy,
    Type,
} from "lucide-react";
import { Button } from "@repo/ui";
import { StepType } from "./types/flow.types";

interface FlowToolbarProps {
    onAddStep?: (type: StepType) => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onFitView?: () => void;
    onValidate?: () => void;
    onExport?: () => void;
    showMinimap?: boolean;
    onToggleMinimap?: () => void;
    validationErrors?: number;
}

const STEP_TYPES: Array<{ type: StepType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { type: "QUESTION", label: "Pergunta", icon: MessageSquare },
    { type: "TEXT", label: "Texto", icon: FileText },
    { type: "CAPTURE", label: "Captura", icon: UserPlus },
    { type: "INPUT", label: "Input", icon: Type },
    { type: "RESULT", label: "Resultado", icon: Trophy },
];

export function FlowToolbar({
    onAddStep,
    onZoomIn,
    onZoomOut,
    onFitView,
    onValidate,
    onExport,
    showMinimap = false,
    onToggleMinimap,
    validationErrors = 0,
}: FlowToolbarProps) {
    const [showAddMenu, setShowAddMenu] = React.useState(false);

    return (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
            {/* Menu Adicionar Step */}
            <div className="relative">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                </Button>
                {showAddMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-0"
                            onClick={() => setShowAddMenu(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[180px] z-20">
                            {STEP_TYPES.map(({ type, label, icon: Icon }) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onAddStep?.(type);
                                        setShowAddMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Controles de Zoom */}
            <div className="flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onZoomIn}
                    className="h-8 w-8 p-0"
                    title="Zoom In"
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onZoomOut}
                    className="h-8 w-8 p-0"
                    title="Zoom Out"
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onFitView}
                    className="h-8 w-8 p-0"
                    title="Fit View"
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Validação */}
            {onValidate && (
                <Button
                    variant={validationErrors > 0 ? "danger" : "outline"}
                    size="sm"
                    onClick={onValidate}
                    className="shadow-lg"
                >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Validar {validationErrors > 0 && `(${validationErrors})`}
                </Button>
            )}

            {/* Exportar */}
            {onExport && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    className="shadow-lg"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                </Button>
            )}
        </div>
    );
}

export default FlowToolbar;
