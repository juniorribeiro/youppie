"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    MiniMap,
    Panel,
    useReactFlow,
    Connection,
    Edge,
    Node,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
    MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { FlowNode, FlowEdge, StepDetail, FlowLayout } from "./types/flow.types";
import { stepsToFlow, flowToSteps, getNodeType } from "./utils/flowConverter";
import { applyAutoLayout, getInitialNodePosition } from "./utils/layoutEngine";
import { validateFlow, applyValidationErrors, applyValidationErrorsToEdges } from "./utils/flowValidator";
import {
    QuestionNode,
    TextNode,
    CaptureNode,
    ResultNode,
    InputNode,
} from "./FlowNodes";
import { ConditionalEdge, ReferenceEdge } from "./FlowEdges";
import FlowToolbar from "./FlowToolbar";
import FlowSidePanel from "./FlowSidePanel";
import ConnectionConfigModal from "./ConnectionConfigModal";

const nodeTypes = {
    question: QuestionNode,
    text: TextNode,
    capture: CaptureNode,
    result: ResultNode,
    input: InputNode,
};

const edgeTypes = {
    conditional: ConditionalEdge,
    reference: ReferenceEdge,
};

interface QuizFlowEditorProps {
    quizId: string;
}

function FlowContent({ quizId }: { quizId: string }) {
    const token = useAuthStore((state) => state.token);
    const { fitView, zoomIn, zoomOut } = useReactFlow();
    const [nodes, setNodes] = useState<FlowNode[]>([]);
    const [edges, setEdges] = useState<FlowEdge[]>([]);
    const [steps, setSteps] = useState<StepDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [savedLayout, setSavedLayout] = useState<FlowLayout | null>(null);
    const [savedSequentialEdges, setSavedSequentialEdges] = useState<Array<{ source: string; target: string }> | null>(null);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
    const [showConnectionModal, setShowConnectionModal] = useState(false);

    // Carregar steps
    useEffect(() => {
        if (!token || !quizId) return;

        const loadSteps = async () => {
            setLoading(true);
            try {
                // Buscar steps
                const stepsData = await apiFetch<StepDetail[]>(`/steps?quizId=${quizId}`, {
                    token,
                });

                // Buscar detalhes completos de cada step
                const stepsWithDetails = await Promise.all(
                    stepsData.map(async (step) => {
                        try {
                            const detail = await apiFetch<StepDetail>(`/steps/${step.id}`, {
                                token,
                            });
                            return detail;
                        } catch {
                            return step;
                        }
                    })
                );

                setSteps(stepsWithDetails);

                // Buscar layout salvo do localStorage (se existir)
                try {
                    const savedLayoutStr = localStorage.getItem(`quiz-flow-layout-${quizId}`);
                    if (savedLayoutStr) {
                        const layoutData = JSON.parse(savedLayoutStr);
                        // Extrair layout (sem edges)
                        const { edges, ...layout } = layoutData;
                        setSavedLayout(layout);
                        // Extrair edges sequenciais salvas
                        if (edges && Array.isArray(edges)) {
                            setSavedSequentialEdges(edges);
                        } else {
                            setSavedSequentialEdges(null);
                        }
                    }
                } catch {
                    // Layout não existe ou erro ao buscar
                }
            } catch (error) {
                console.error("Erro ao carregar steps:", error);
            } finally {
                setLoading(false);
            }
        };

        loadSteps();
    }, [token, quizId]);

    // Handler para deletar node (declarado antes de ser usado)
    const handleNodeDelete = useCallback(
        async (nodeId: string) => {
            if (!token) return;
            
            if (!confirm("Tem certeza que deseja deletar este step? Esta ação não pode ser desfeita.")) {
                return;
            }

            try {
                // Deletar step da API
                await apiFetch(`/steps/${nodeId}`, {
                    method: "DELETE",
                    token,
                });

                // Remover node do flow
                setNodes((nds) => nds.filter((n) => n.id !== nodeId));

                // Remover edges conectadas
                setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));

                // Remover step da lista
                setSteps((sts) => sts.filter((s) => s.id !== nodeId));

                // Fechar side panel se o node deletado estava selecionado
                if (selectedNodeId === nodeId) {
                    setSelectedNodeId(null);
                    setShowSidePanel(false);
                }
            } catch (error) {
                console.error("Erro ao deletar step:", error);
                alert("Falha ao deletar step");
            }
        },
        [token, selectedNodeId]
    );

    // Converter steps para nodes/edges
    useEffect(() => {
        if (steps.length === 0) return;

        const { nodes: flowNodes, edges: flowEdges } = stepsToFlow(steps, savedLayout, savedSequentialEdges);

        // Aplicar layout automático se não houver layout salvo ou se algum node não tiver posição válida
        let layoutedNodes = flowNodes;
        const hasValidLayout = savedLayout && savedLayout.nodes.length > 0 && 
            flowNodes.every(node => {
                const savedNode = savedLayout.nodes.find(n => n.id === node.id);
                return savedNode && savedNode.x !== undefined && savedNode.y !== undefined;
            });
        
        if (!hasValidLayout) {
            // Aplicar layout vertical automático (top to bottom)
            layoutedNodes = applyAutoLayout(flowNodes, flowEdges);
        }

        // Adicionar função onDelete a cada node
        const nodesWithDelete = layoutedNodes.map((node) => ({
            ...node,
            data: {
                ...node.data,
                onDelete: () => handleNodeDelete(node.id),
            },
        }));

        setNodes(nodesWithDelete);
        setEdges(flowEdges);

        // Apenas centralizar na primeira carga se não houver layout salvo
        if (!savedLayout || savedLayout.nodes.length === 0) {
            setTimeout(() => {
                fitView({ padding: 0.2 });
            }, 100);
        }
    }, [steps, savedLayout, savedSequentialEdges, fitView, handleNodeDelete]);

    // Validar flow
    const handleValidate = useCallback(() => {
        const result = validateFlow(nodes, edges, steps);
        setValidationResult(result);

        // Aplicar erros aos nodes e edges
        const nodesWithErrors = applyValidationErrors(nodes, result);
        const edgesWithErrors = applyValidationErrorsToEdges(edges, result);

        setNodes(nodesWithErrors);
        setEdges(edgesWithErrors);

        // Alertar sobre erros
        if (!result.valid) {
            const errorCount = result.errors.length;
            alert(`Foram encontrados ${errorCount} erro(s) de validação. Verifique os elementos marcados em vermelho.`);
        } else {
            alert("Flow válido! Nenhum erro encontrado.");
        }
    }, [nodes, edges, steps]);

    // Adicionar novo step
    const handleAddStep = useCallback(
        async (type: string) => {
            if (!token) return;

            try {
                const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
                const maxOrder = sortedSteps.length > 0 ? Math.max(...sortedSteps.map((s) => s.order)) : 0;
                const newOrder = maxOrder + 1;

                // Preparar body baseado no tipo
                const body: any = {
                    quizId,
                    title: `Novo ${type}`,
                    type,
                    order: newOrder,
                };

                // Para steps INPUT, adicionar metadata padrão
                if (type === "INPUT") {
                    body.metadata = {
                        variableName: `input_${Date.now()}`,
                        inputType: "text",
                    };
                }

                const newStep = await apiFetch<StepDetail>("/steps", {
                    method: "POST",
                    token,
                    body: JSON.stringify(body),
                });

                // Adicionar node no flow
                const position = getInitialNodePosition(nodes);
                const nodeData = {
                    step: newStep,
                    label: newStep.title,
                    hasRules: false,
                };

                const newNode: FlowNode = {
                    id: newStep.id,
                    type: getNodeType(type),
                    data: {
                        ...nodeData,
                        onDelete: () => handleNodeDelete(newStep.id),
                    },
                    position,
                };

                setNodes([...nodes, newNode]);
                setSteps([...steps, newStep]);
                setSelectedNodeId(newStep.id);
                setShowSidePanel(true);
            } catch (error) {
                console.error("Erro ao adicionar step:", error);
                alert("Falha ao adicionar step");
            }
        },
        [token, quizId, nodes, steps]
    );

    // Salvar layout e edges (debounced)
    const saveLayoutDebounced = useCallback(
        async (nodesToSave: FlowNode[], edgesToSave: FlowEdge[]) => {
            if (!token || saving) return;

            setSaving(true);
            try {
                const { layout } = flowToSteps(nodesToSave, steps);

                // Separar edges sequenciais das outras
                const sequentialEdges = edgesToSave
                    .filter(e => e.data?.type === "sequential")
                    .map(e => ({ source: e.source, target: e.target }));

                // Salvar layout e edges sequenciais no localStorage
                const layoutWithEdges = {
                    ...layout,
                    edges: sequentialEdges,
                };
                localStorage.setItem(`quiz-flow-layout-${quizId}`, JSON.stringify(layoutWithEdges));
                setSavedLayout(layout);
                setSavedSequentialEdges(sequentialEdges.length > 0 ? sequentialEdges : null);
            } catch (error) {
                console.error("Erro ao salvar layout:", error);
            } finally {
                setSaving(false);
            }
        },
        [token, quizId, steps, saving]
    );

    // Debounce helper para salvar layout e edges (quando nodes ou edges mudarem)
    const nodesPositionKey = nodes.map((n) => `${n.id}-${n.position.x}-${n.position.y}`).join(",");
    const edgesKey = edges.map((e) => `${e.source}-${e.target}`).join(",");
    useEffect(() => {
        if (nodes.length === 0) return;
        
        const timeout = setTimeout(() => {
            saveLayoutDebounced(nodes, edges);
        }, 500);
        
        return () => {
            clearTimeout(timeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodesPositionKey, edgesKey]);

    // Handlers do React Flow
    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds as any) as unknown as FlowNode[]);
        },
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            // Detectar deleção de edges
            changes.forEach((change) => {
                if (change.type === "remove") {
                    const edge = edges.find((e) => e.id === change.id);
                    if (edge) {
                        if (edge.data?.type === "conditional" && edge.data?.ruleId) {
                            // Remover regra do step quando edge condicional é deletada
                            const sourceStep = steps.find((s) => s.id === edge.source);
                            if (sourceStep) {
                                const currentMetadata = sourceStep.metadata || {};
                                const currentRules = (currentMetadata as any).rules || [];
                                const updatedRules = currentRules.filter(
                                    (r: any) => r.id !== edge.data?.ruleId
                                );

                                // Atualizar step na API
                                if (token) {
                                    apiFetch(`/steps/${sourceStep.id}`, {
                                        method: "PATCH",
                                        token,
                                        body: JSON.stringify({
                                            title: sourceStep.title,
                                            description: sourceStep.description,
                                            image_url: sourceStep.image_url || undefined,
                                            metadata: {
                                                ...currentMetadata,
                                                rules: updatedRules,
                                            },
                                            ...(sourceStep.type === "QUESTION" && sourceStep.question
                                                ? {
                                                      question: {
                                                          text: sourceStep.question.text,
                                                          options: sourceStep.question.options,
                                                      },
                                                  }
                                                : {}),
                                        }),
                                    }).then(() => {
                                        // Atualizar step local
                                        setSteps((sts) =>
                                            sts.map((s) => {
                                                if (s.id === sourceStep.id) {
                                                    return {
                                                        ...s,
                                                        metadata: {
                                                            ...currentMetadata,
                                                            rules: updatedRules,
                                                        },
                                                    };
                                                }
                                                return s;
                                            })
                                        );
                                    });
                                }
                            }
                        } else if (edge.data?.type === "sequential") {
                            // Remover edge sequencial do estado salvo
                            setSavedSequentialEdges((prev) => {
                                if (!prev) return null;
                                const updated = prev.filter(
                                    (e) => !(e.source === edge.source && e.target === edge.target)
                                );
                                
                                // Salvar no localStorage
                                try {
                                    const savedLayoutStr = localStorage.getItem(`quiz-flow-layout-${quizId}`);
                                    if (savedLayoutStr) {
                                        const layoutData = JSON.parse(savedLayoutStr);
                                        const { edges: _, ...layout } = layoutData;
                                        const layoutWithEdges = {
                                            ...layout,
                                            edges: updated.length > 0 ? updated : [],
                                        };
                                        localStorage.setItem(`quiz-flow-layout-${quizId}`, JSON.stringify(layoutWithEdges));
                                    }
                                } catch (error) {
                                    console.error("Erro ao salvar remoção de edge sequencial:", error);
                                }
                                
                                return updated.length > 0 ? updated : null;
                            });
                        }
                    }
                }
            });

            setEdges((eds) => applyEdgeChanges(changes, eds as any) as unknown as FlowEdge[]);
        },
        [edges, steps, token, quizId]
    );

    const onEdgeClick = useCallback(
        (_event: React.MouseEvent, edge: Edge) => {
            const flowEdge = edge as unknown as FlowEdge;
            
            // Se for edge condicional, permitir editar
            if (flowEdge.data?.type === "conditional") {
                const sourceStep = steps.find((s) => s.id === flowEdge.source);
                const targetStep = steps.find((s) => s.id === flowEdge.target);
                
                if (sourceStep && targetStep) {
                    // Abrir side panel para editar o step e suas regras
                    setSelectedNodeId(sourceStep.id);
                    setShowSidePanel(true);
                }
            } else if (flowEdge.data?.type === "sequential") {
                // Para edges sequenciais, apenas mostrar informação ou permitir deletar
                if (confirm("Deseja deletar esta ligação sequencial?")) {
                    setEdges((eds) => eds.filter((e) => e.id !== flowEdge.id));
                }
            }
        },
        [steps]
    );

    // Helper functions para labels de condição
    const getOperatorSymbol = (operator: string): string => {
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
    };

    const getConditionLabel = (condition: any, allSteps: StepDetail[]): string => {
        if (condition.type === "answer") {
            const step = allSteps.find((s) => s.id === condition.source);
            const stepTitle = step?.title || condition.source;
            const operator = getOperatorSymbol(condition.operator);
            return `${stepTitle} ${operator} ${condition.value}`;
        } else {
            const operator = getOperatorSymbol(condition.operator);
            return `${condition.source} ${operator} ${condition.value}`;
        }
    };

    const onConnect = useCallback(
        (connection: Connection) => {
            // Não criar edge automaticamente - abrir modal de configuração
            setPendingConnection(connection);
            setShowConnectionModal(true);
        },
        []
    );

    // Handler para salvar conexão configurada
    const handleSaveConnection = useCallback(
        async (config: {
            type: "sequential" | "conditional";
            rule?: any;
        }) => {
            if (!pendingConnection || !token) return;

            try {
                if (config.type === "sequential") {
                    // Criar edge sequencial simples
                    const newEdge: FlowEdge = {
                        id: `sequential-${pendingConnection.source}-${pendingConnection.target}`,
                        source: pendingConnection.source!,
                        target: pendingConnection.target!,
                        type: "default",
                        data: {
                            type: "sequential",
                            label: undefined,
                        },
                        style: {
                            stroke: "#3b82f6",
                            strokeWidth: 2,
                        },
                    };
                    setEdges((eds) => [...eds, newEdge]);
                    
                    // Atualizar edges sequenciais salvas
                    const updatedSequentialEdges = [
                        ...(savedSequentialEdges || []),
                        { source: pendingConnection.source!, target: pendingConnection.target! },
                    ];
                    setSavedSequentialEdges(updatedSequentialEdges);
                    
                    // Salvar no localStorage
                    try {
                        const savedLayoutStr = localStorage.getItem(`quiz-flow-layout-${quizId}`);
                        if (savedLayoutStr) {
                            const layoutData = JSON.parse(savedLayoutStr);
                            const { edges: _, ...layout } = layoutData;
                            const layoutWithEdges = {
                                ...layout,
                                edges: updatedSequentialEdges,
                            };
                            localStorage.setItem(`quiz-flow-layout-${quizId}`, JSON.stringify(layoutWithEdges));
                        }
                    } catch (error) {
                        console.error("Erro ao salvar edge sequencial:", error);
                    }
                } else if (config.type === "conditional" && config.rule) {
                    // Criar edge condicional e adicionar regra ao step
                    const sourceStep = steps.find((s) => s.id === pendingConnection.source);
                    if (!sourceStep) {
                        alert("Step de origem não encontrado");
                        return;
                    }

                    // Atualizar step com a nova regra
                    const currentMetadata = sourceStep.metadata || {};
                    const currentRules = (currentMetadata as any).rules || [];
                    const updatedRules = [...currentRules, config.rule];

                    const updatedStep = {
                        ...sourceStep,
                        metadata: {
                            ...currentMetadata,
                            rules: updatedRules,
                        },
                    };

                    // Salvar step atualizado na API
                    await apiFetch(`/steps/${sourceStep.id}`, {
                        method: "PATCH",
                        token,
                        body: JSON.stringify({
                            title: updatedStep.title,
                            description: updatedStep.description,
                            image_url: updatedStep.image_url || undefined,
                            metadata: updatedStep.metadata,
                            ...(updatedStep.type === "QUESTION" && updatedStep.question
                                ? {
                                      question: {
                                          text: updatedStep.question.text,
                                          options: updatedStep.question.options,
                                      },
                                  }
                                : {}),
                        }),
                    });

                    // Atualizar step local
                    setSteps((sts) => sts.map((s) => (s.id === updatedStep.id ? updatedStep : s)));

                    // Criar edge condicional
                    const condition = config.rule.conditions?.[0];
                    const label = condition
                        ? getConditionLabel(condition, steps)
                        : undefined;

                    const newEdge: FlowEdge = {
                        id: `conditional-${pendingConnection.source}-${pendingConnection.target}-${config.rule.id}`,
                        source: pendingConnection.source!,
                        target: pendingConnection.target!,
                        type: "smoothstep",
                        data: {
                            type: "conditional",
                            ruleId: config.rule.id,
                            condition: condition,
                            label,
                        },
                        style: {
                            stroke: "#f97316",
                            strokeWidth: 2,
                            strokeDasharray: "5,5",
                        },
                        animated: false,
                    };
                    setEdges((eds) => [...eds, newEdge]);

                    // Atualizar node para mostrar que tem regras
                    setNodes((nds) =>
                        nds.map((n) => {
                            if (n.id === sourceStep.id) {
                                return {
                                    ...n,
                                    data: {
                                        ...n.data,
                                        hasRules: true,
                                        step: updatedStep,
                                    },
                                };
                            }
                            return n;
                        })
                    );
                }

                setPendingConnection(null);
                setShowConnectionModal(false);
            } catch (error) {
                console.error("Erro ao salvar conexão:", error);
                alert("Falha ao salvar conexão");
            }
        },
        [pendingConnection, token, steps, getConditionLabel]
    );

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
        setShowSidePanel(true);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    // Suporte para tecla Delete quando node está selecionado
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Verificar se está digitando em um campo editável
            const target = event.target as HTMLElement;
            const isEditable = target.tagName === 'INPUT' || 
                               target.tagName === 'TEXTAREA' || 
                               target.isContentEditable ||
                               target.closest('[contenteditable="true"]') !== null;
            
            if ((event.key === "Delete" || event.key === "Backspace") && selectedNodeId && !isEditable) {
                event.preventDefault();
                handleNodeDelete(selectedNodeId);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedNodeId, handleNodeDelete]);

    // Exportar flow
    const handleExport = useCallback(() => {
        const exportData = {
            nodes: nodes.map((n) => ({
                id: n.id,
                type: n.data.step.type,
                title: n.data.step.title,
                position: n.position,
            })),
            edges: edges.map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                type: e.data?.type,
            })),
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `quiz-flow-${quizId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [nodes, edges, quizId]);

    // Atualizar step
    const handleStepUpdate = useCallback(
        async (updatedStep: any) => {
            setSteps((sts) => sts.map((s) => (s.id === updatedStep.id ? updatedStep : s)));

            // Atualizar node correspondente
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === updatedStep.id) {
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                step: updatedStep,
                                hasRules: Boolean(
                                    updatedStep.metadata?.rules && updatedStep.metadata.rules.length > 0
                                ),
                            },
                        };
                    }
                    return n;
                })
            );

            // Recarregar edges para refletir mudanças nas regras
            const stepDetails = steps.map((s) => (s.id === updatedStep.id ? updatedStep : s));
            const { edges: newEdges } = stepsToFlow(stepDetails, savedLayout);
            setEdges(newEdges);
        },
        [steps, savedLayout]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Carregando flow...</div>
            </div>
        );
    }

    const errorCount = validationResult?.errors?.length || 0;

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onEdgeClick={onEdgeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                defaultEdgeOptions={{
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                    },
                }}
            >
                <Background />
                <Controls />
                <MiniMap />

            <FlowToolbar
                onAddStep={handleAddStep}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onFitView={() => fitView({ padding: 0.2 })}
                onValidate={handleValidate}
                onExport={handleExport}
                validationErrors={errorCount}
            />

            <FlowSidePanel
                isOpen={showSidePanel}
                onClose={() => {
                    setShowSidePanel(false);
                    setSelectedNodeId(null);
                }}
                selectedStepId={selectedNodeId}
                quizId={quizId}
                onStepUpdate={handleStepUpdate}
                onAddStep={handleAddStep}
            />

            {saving && (
                <Panel position="top-right" className="bg-white px-4 py-2 rounded shadow-lg border">
                    Salvando layout...
                </Panel>
            )}
            </ReactFlow>

            {pendingConnection && (
                <ConnectionConfigModal
                    isOpen={showConnectionModal}
                    onClose={() => {
                        setShowConnectionModal(false);
                        setPendingConnection(null);
                    }}
                    sourceStepId={pendingConnection.source || ""}
                    targetStepId={pendingConnection.target || ""}
                    sourceStep={steps.find((s) => s.id === pendingConnection.source) || null}
                    targetStep={steps.find((s) => s.id === pendingConnection.target) || null}
                    allSteps={steps}
                    onSave={handleSaveConnection}
                />
            )}
        </div>
    );
}

export default function QuizFlowEditor({ quizId }: QuizFlowEditorProps) {
    return (
        <div className="w-full h-[calc(100vh-200px)] relative">
            <ReactFlowProvider>
                <FlowContent quizId={quizId} />
            </ReactFlowProvider>
        </div>
    );
}
