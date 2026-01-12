"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, MessageSquare, FileText, UserPlus, Trophy, GripVertical, Type } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import StepEditor from "./StepEditor";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Step {
    id: string;
    title: string;
    type: "QUESTION" | "TEXT" | "CAPTURE" | "RESULT" | "INPUT";
    order: number;
}

const STEP_ICONS = {
    QUESTION: MessageSquare,
    TEXT: FileText,
    CAPTURE: UserPlus,
    RESULT: Trophy,
    INPUT: Type,
};

const STEP_COLORS = {
    QUESTION: "bg-primary-50 text-primary-600 border-primary-200",
    TEXT: "bg-purple-50 text-purple-600 border-purple-200",
    CAPTURE: "bg-success-50 text-success-600 border-success-200",
    RESULT: "bg-warning-50 text-warning-600 border-warning-200",
    INPUT: "bg-info-50 text-info-600 border-info-200",
};

const STEP_LABELS = {
    QUESTION: "Pergunta",
    TEXT: "Texto",
    CAPTURE: "Captura",
    RESULT: "Resultado",
    INPUT: "Input",
};

interface SortableStepCardProps {
    step: Step;
    selectedStepId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

function SortableStepCard({ step, selectedStepId, onSelect, onDelete }: SortableStepCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id });

    const Icon = STEP_ICONS[step.type];

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelect(step.id)}
            className={`group flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                selectedStepId === step.id
                    ? "border-primary-500 bg-primary-50 shadow-md scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300"
            } ${isDragging ? "z-50 shadow-lg" : ""}`}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 -ml-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="h-5 w-5" />
                </div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${STEP_COLORS[step.type]}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{step.order}</span>
                        <span className="text-sm font-semibold text-gray-900 truncate">
                            {step.title}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500">{STEP_LABELS[step.type]}</span>
                </div>
            </div>
            <div className="z-10 relative">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-danger-500 hover:bg-danger-50"
                    onClick={(e) => onDelete(step.id, e)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default function StepsList({ quizId }: { quizId: string }) {
    const token = useAuthStore((state) => state.token);
    const [steps, setSteps] = useState<Step[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchSteps = async () => {
        try {
            const data = await apiFetch<Step[]>(`/steps?quizId=${quizId}`, { token: token! });
            setSteps(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSteps();
    }, [token, quizId]);

    const addStep = async (type: Step["type"]) => {
        if (!quizId) {
            alert("Erro: ID do quiz não encontrado");
            return;
        }
        
        // Ordenar steps por order para encontrar a posição correta
        const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
        
        // Encontrar se existe step RESULT e sua posição
        const resultStepIndex = sortedSteps.findIndex(s => s.type === "RESULT");
        
        let insertOrder: number;
        let stepsToUpdate: { id: string; order: number }[] = [];
        
        if (resultStepIndex !== -1) {
            // Se existe RESULT, inserir antes dele
            const resultStep = sortedSteps[resultStepIndex];
            insertOrder = resultStep.order;
            
            // Atualizar orders dos steps que vêm depois (incluindo o RESULT)
            // Todos os steps com order >= insertOrder precisam ter order + 1
            sortedSteps.forEach((step, index) => {
                if (step.order >= insertOrder) {
                    stepsToUpdate.push({
                        id: step.id,
                        order: step.order + 1
                    });
                }
            });
        } else {
            // Se não existe RESULT, adicionar no final (comportamento atual)
            const maxOrder = steps.length > 0 ? Math.max(...steps.map((s) => s.order)) : 0;
            insertOrder = maxOrder + 1;
        }
        
        try {
            // Criar o novo step
            const newStep = await apiFetch<Step>("/steps", {
                method: "POST",
                token: token!,
                body: JSON.stringify({
                    quizId,
                    title: `Nova ${STEP_LABELS[type]}`,
                    type,
                    order: insertOrder,
                }),
            });
            
            // Atualizar orders dos steps afetados (se houver)
            if (stepsToUpdate.length > 0) {
                // Atualizar cada step afetado
                await Promise.all(
                    stepsToUpdate.map(stepUpdate =>
                        apiFetch(`/steps/${stepUpdate.id}`, {
                            method: "PATCH",
                            token: token!,
                            body: JSON.stringify({ order: stepUpdate.order }),
                        })
                    )
                );
                
                // Atualizar estado local
                const updatedSteps = steps.map(step => {
                    const update = stepsToUpdate.find(u => u.id === step.id);
                    return update ? { ...step, order: update.order } : step;
                });
                setSteps([...updatedSteps, newStep]);
            } else {
                setSteps([...steps, newStep]);
            }
            
            setSelectedStepId(newStep.id);
        } catch (e) {
            console.error(e);
            alert("Falha ao adicionar step");
        }
    };

    const deleteStep = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Tem certeza?")) return;

        try {
            await apiFetch(`/steps/${id}`, { method: "DELETE", token: token! });
            setSteps(steps.filter((s) => s.id !== id));
            if (selectedStepId === id) setSelectedStepId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (!over || active.id === over.id) return;

        const oldIndex = steps.findIndex((s) => s.id === active.id);
        const newIndex = steps.findIndex((s) => s.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        // Verificar se está tentando mover para depois de um RESULT
        const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
        
        // Simular o reordenamento para verificar se algum step não-RESULT ficará após um RESULT
        const reorderedSteps = arrayMove(sortedSteps, oldIndex, newIndex);
        const resultStepIndex = reorderedSteps.findIndex(s => s.type === "RESULT");
        
        // Se há um RESULT na lista reordenada, verificar se algum step não-RESULT vem depois dele
        if (resultStepIndex !== -1) {
            const hasNonResultAfter = reorderedSteps
                .slice(resultStepIndex + 1)
                .some(s => s.type !== "RESULT");
            
            if (hasNonResultAfter) {
                alert("Não é possível adicionar steps após o step de Resultado");
                return; // Cancelar o drop
            }
        }

        // Salvar estado anterior para possível reversão
        const previousSteps = [...steps];

        // Reordenar localmente
        const newSteps = arrayMove(steps, oldIndex, newIndex);
        // Atualizar os valores de order para refletir a nova posição
        const updatedSteps = newSteps.map((step, index) => ({
            ...step,
            order: index,
        }));
        
        setSteps(updatedSteps);

        // Salvar no backend
        try {
            await apiFetch(`/steps/reorder/${quizId}`, {
                method: "POST",
                token: token!,
                body: JSON.stringify({ orderedIds: updatedSteps.map((s) => s.id) }),
            });
        } catch (error) {
            console.error("Erro ao reordenar steps:", error);
            // Reverter em caso de erro
            setSteps(previousSteps);
            alert("Erro ao reordenar steps. Tente novamente.");
        }
    };

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-4 space-y-4">
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Steps</h3>
                            <Badge variant="info">{steps.length}</Badge>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={steps.map((s) => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {steps
                                        .sort((a, b) => a.order - b.order)
                                        .map((step) => (
                                            <SortableStepCard
                                                key={step.id}
                                                step={step}
                                                selectedStepId={selectedStepId}
                                                onSelect={setSelectedStepId}
                                                onDelete={deleteStep}
                                            />
                                        ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {/* Add Step Buttons */}
                        <div className="mt-6 space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Adicionar Step</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(STEP_LABELS).map(([type, label]) => {
                                    const Icon = STEP_ICONS[type as Step["type"]];
                                    return (
                                        <Button
                                            key={type}
                                            size="sm"
                                            variant="outline"
                                            onClick={() => addStep(type as Step["type"])}
                                            className="justify-start"
                                        >
                                            <Icon className="mr-2 h-3 w-3" />
                                            {label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Editor */}
            <div className="col-span-8">
                {selectedStepId ? (
                    <StepEditor
                        stepId={selectedStepId}
                        onUpdate={(updatedStep) => {
                            setSteps(steps.map((s) => (s.id === updatedStep.id ? { ...s, ...updatedStep } : s)));
                        }}
                    />
                ) : (
                    <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">Selecione um step</p>
                        <p className="text-sm text-gray-500">ou adicione um novo para começar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
