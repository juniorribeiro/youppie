import { FlowNode, FlowEdge, FlowNodeData, FlowEdgeData, StepDetail, FlowLayout, FlowNodeType } from "../types/flow.types";

/**
 * Converte steps para nodes e edges do React Flow
 */
export function stepsToFlow(
    steps: StepDetail[],
    savedLayout?: FlowLayout | null,
    savedSequentialEdges?: Array<{ source: string; target: string }> | null
): { nodes: FlowNode[]; edges: FlowEdge[] } {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    const referenceEdges: FlowEdge[] = []; // Separar edges de referência para renderizar por último
    const sequentialEdges: FlowEdge[] = []; // Edges sequenciais salvas

    // Ordenar steps por order
    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

    // Criar nodes
    sortedSteps.forEach((step, index) => {
        // Verificar se há posição salva
        const savedNode = savedLayout?.nodes.find((n) => n.id === step.id);
        const position = savedNode
            ? { x: savedNode.x, y: savedNode.y }
            : { x: 0, y: 0 }; // Será definido pelo layout engine

        const hasRules = Boolean(step.metadata?.rules && step.metadata.rules.length > 0);

        const nodeData: FlowNodeData = {
            step,
            label: step.title,
            hasRules,
        };

        nodes.push({
            id: step.id,
            type: getNodeType(step.type),
            data: nodeData,
            position,
        });
    });

    // Restaurar edges sequenciais salvas
    if (savedSequentialEdges && Array.isArray(savedSequentialEdges)) {
        savedSequentialEdges.forEach((savedEdge) => {
            // Verificar se ambos os steps existem
            const sourceExists = sortedSteps.some((s) => s.id === savedEdge.source);
            const targetExists = sortedSteps.some((s) => s.id === savedEdge.target);
            
            if (sourceExists && targetExists) {
                // Verificar se já não existe uma edge condicional entre esses steps
                const hasConditionalEdge = checkConditionalEdgeExists(savedEdge.source, savedEdge.target, sortedSteps);
                
                if (!hasConditionalEdge) {
                    sequentialEdges.push({
                        id: `sequential-${savedEdge.source}-${savedEdge.target}`,
                        source: savedEdge.source,
                        target: savedEdge.target,
                        type: "default",
                        data: {
                            type: "sequential",
                            label: undefined,
                        },
                        style: {
                            stroke: "#3b82f6", // azul
                            strokeWidth: 2,
                        },
                    });
                }
            }
        });
    }

    // Criar edges condicionais das regras
    sortedSteps.forEach((step) => {
        const rules = step.metadata?.rules || [];
        rules.forEach((rule) => {
            rule.actions.forEach((action) => {
                if (action.type === "goto" && action.target) {
                    const targetExists = sortedSteps.some((s) => s.id === action.target);
                    if (targetExists) {
                        const condition = rule.conditions?.[0]; // Pegar primeira condição para label
                        const label = condition
                            ? getConditionLabel(condition, sortedSteps)
                            : undefined;

                        edges.push({
                            id: `conditional-${step.id}-${action.target}-${rule.id}`,
                            source: step.id,
                            target: action.target,
                            type: "smoothstep",
                            data: {
                                type: "conditional",
                                ruleId: rule.id,
                                condition: condition,
                                label,
                            },
                            style: {
                                stroke: "#f97316", // laranja
                                strokeWidth: 2,
                                strokeDasharray: "5,5",
                            },
                            animated: false,
                        });
                    }
                }
            });
        });
    });

    // Criar edges de referência para condições que referenciam outros steps
    sortedSteps.forEach((step) => {
        const rules = step.metadata?.rules || [];
        rules.forEach((rule, ruleIndex) => {
            rule.conditions?.forEach((condition, conditionIndex) => {
                // Apenas para condições do tipo "answer" que referenciam um step
                if (condition.type === "answer" && condition.source) {
                    const referencedStep = sortedSteps.find((s) => s.id === condition.source);
                    
                    if (referencedStep) {
                        // Verificar se já existe uma edge condicional ou sequencial entre esses steps
                        const hasExistingEdge = edges.some(
                            (e) =>
                                (e.source === step.id && e.target === referencedStep.id) ||
                                (e.source === referencedStep.id && e.target === step.id)
                        );

                        // Não criar edge de referência se já existe uma edge condicional/sequencial
                        // (evitar duplicação visual)
                        if (!hasExistingEdge) {
                            referenceEdges.push({
                                id: `reference-${step.id}-${referencedStep.id}-${rule.id}-${conditionIndex}`,
                                source: step.id,
                                target: referencedStep.id,
                                type: "reference",
                                data: {
                                    type: "reference",
                                    referencedStepId: referencedStep.id,
                                    referencedStepTitle: referencedStep.title,
                                    conditionType: condition.type,
                                    conditionSource: condition.source,
                                    conditionOperator: condition.operator,
                                    conditionValue: condition.value,
                                    ruleId: rule.id,
                                },
                                style: {
                                    stroke: "#9ca3af", // cinza claro
                                    strokeWidth: 1.5,
                                    strokeDasharray: "8,4", // tracejado mais espaçado
                                },
                            });
                        }
                    }
                }
            });
        });
    });

    // Adicionar edges de referência primeiro para que sejam renderizadas abaixo das outras
    // Depois edges sequenciais, depois edges condicionais
    // (no React Flow, as últimas edges no array são renderizadas por cima)
    return { nodes, edges: [...referenceEdges, ...sequentialEdges, ...edges] };
}

/**
 * Verifica se já existe uma edge condicional entre source e target
 */
function checkConditionalEdgeExists(
    sourceId: string,
    targetId: string,
    steps: StepDetail[]
): boolean {
    const sourceStep = steps.find((s) => s.id === sourceId);
    if (!sourceStep) return false;

    const rules = sourceStep.metadata?.rules || [];
    return rules.some((rule) =>
        rule.actions.some((action) => action.type === "goto" && action.target === targetId)
    );
}

/**
 * Obtém label resumido de uma condição
 */
function getConditionLabel(condition: any, steps: StepDetail[]): string {
    if (condition.type === "answer") {
        const step = steps.find((s) => s.id === condition.source);
        const stepTitle = step?.title || condition.source;
        const operator = getOperatorSymbol(condition.operator);
        return `${stepTitle} ${operator} ${condition.value}`;
    } else {
        // variable
        const operator = getOperatorSymbol(condition.operator);
        return `${condition.source} ${operator} ${condition.value}`;
    }
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

/**
 * Obtém tipo de node baseado no tipo de step
 */
export function getNodeType(stepType: string): FlowNodeType {
    const nodeTypes: Record<string, FlowNodeType> = {
        QUESTION: "question",
        TEXT: "text",
        CAPTURE: "capture",
        RESULT: "result",
        INPUT: "input",
    };
    return nodeTypes[stepType] || "default";
}

/**
 * Converte nodes e edges de volta para estrutura de steps
 * (principalmente para atualizar posições e order se necessário)
 */
export function flowToSteps(
    nodes: FlowNode[],
    originalSteps: StepDetail[]
): { steps: StepDetail[]; layout: FlowLayout } {
    // Mapear posições dos nodes
    const layout: FlowLayout = {
        nodes: nodes.map((node) => ({
            id: node.id,
            x: node.position.x,
            y: node.position.y,
        })),
        version: "1.0",
    };

    // Retornar steps originais (estrutura não muda, apenas layout)
    // A ordem pode ser inferida do layout ou mantida como está
    return {
        steps: originalSteps,
        layout,
    };
}

/**
 * Extrai order dos steps baseado na posição Y dos nodes
 */
export function extractOrderFromLayout(nodes: FlowNode[]): Record<string, number> {
    // Ordenar por Y, depois por X
    const sorted = [...nodes].sort((a, b) => {
        if (Math.abs(a.position.y - b.position.y) < 50) {
            // Mesma linha aproximada, ordenar por X
            return a.position.x - b.position.x;
        }
        return a.position.y - b.position.y;
    });

    const orderMap: Record<string, number> = {};
    sorted.forEach((node, index) => {
        orderMap[node.id] = index;
    });

    return orderMap;
}
