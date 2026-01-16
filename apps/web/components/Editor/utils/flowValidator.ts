import { FlowNode, FlowEdge, FlowValidationResult, ValidationError, StepDetail } from "../types/flow.types";

/**
 * Valida o flow completo (nodes e edges)
 */
export function validateFlow(
    nodes: FlowNode[],
    edges: FlowEdge[],
    steps: StepDetail[]
): FlowValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validações estruturais
    validateStructure(nodes, edges, errors, warnings);

    // Validações de regras
    validateRules(nodes, steps, errors, warnings);

    // Validações de conexões
    validateConnections(nodes, edges, errors, warnings);

    return {
        valid: errors.length === 0,
        errors,
        warnings: warnings.map((w) => ({ nodeId: w.nodeId, edgeId: w.edgeId, message: w.message })),
    };
}

/**
 * Validações estruturais
 */
function validateStructure(
    nodes: FlowNode[],
    edges: FlowEdge[],
    errors: ValidationError[],
    warnings: ValidationError[]
) {
    // Verificar se há nodes
    if (nodes.length === 0) {
        errors.push({
            type: "structural",
            message: "O flow deve ter pelo menos um step",
            severity: "error",
        });
        return;
    }

    // Verificar se há step RESULT
    const hasResult = nodes.some((node) => node.data.step.type === "RESULT");
    if (!hasResult) {
        warnings.push({
            type: "structural",
            message: "O quiz não possui um step de Resultado",
            severity: "warning",
        });
    }

    // Verificar se step RESULT está no final (ou pelo menos não tem conexões de saída)
    const resultNodes = nodes.filter((node) => node.data.step.type === "RESULT");
    resultNodes.forEach((resultNode) => {
        const hasOutgoingEdges = edges.some((edge) => edge.source === resultNode.id);
        if (hasOutgoingEdges) {
            warnings.push({
                type: "structural",
                nodeId: resultNode.id,
                message: "Step de Resultado não deve ter conexões de saída",
                severity: "warning",
            });
        }
    });

    // Verificar se há nodes desconectados
    nodes.forEach((node) => {
        const hasIncoming = edges.some((edge) => edge.target === node.id);
        const hasOutgoing = edges.some((edge) => edge.source === node.id);
        const isFirst = nodes[0]?.id === node.id;

        // Primeiro node não precisa de entrada
        if (!isFirst && !hasIncoming) {
            warnings.push({
                type: "structural",
                nodeId: node.id,
                message: "Step não possui conexões de entrada",
                severity: "warning",
            });
        }
    });
}

/**
 * Validações de regras
 */
function validateRules(
    nodes: FlowNode[],
    steps: StepDetail[],
    errors: ValidationError[],
    warnings: ValidationError[]
) {
    nodes.forEach((node) => {
        const step = steps.find((s) => s.id === node.id);
        if (!step) return;

        const rules = step.metadata?.rules || [];
        const nodeErrors: string[] = [];

        rules.forEach((rule, ruleIndex) => {
            // Validar condições
            if (!rule.conditions || rule.conditions.length === 0) {
                nodeErrors.push(`Regra ${ruleIndex + 1}: não possui condições`);
            }

            rule.conditions?.forEach((condition, condIndex) => {
                if (!condition.type || (condition.type !== "answer" && condition.type !== "variable")) {
                    nodeErrors.push(
                        `Regra ${ruleIndex + 1}, Condição ${condIndex + 1}: tipo inválido`
                    );
                }
                if (!condition.source || condition.source.trim() === "") {
                    nodeErrors.push(
                        `Regra ${ruleIndex + 1}, Condição ${condIndex + 1}: source não pode estar vazio`
                    );
                }
                if (!condition.operator) {
                    nodeErrors.push(
                        `Regra ${ruleIndex + 1}, Condição ${condIndex + 1}: operador não pode estar vazio`
                    );
                }
                if (condition.value === undefined || condition.value === null) {
                    nodeErrors.push(
                        `Regra ${ruleIndex + 1}, Condição ${condIndex + 1}: valor não pode estar vazio`
                    );
                }

                // Validar referência de step em condições do tipo "answer"
                if (condition.type === "answer") {
                    const referencedStep = steps.find((s) => s.id === condition.source);
                    if (!referencedStep) {
                        nodeErrors.push(
                            `Regra ${ruleIndex + 1}, Condição ${condIndex + 1}: step referenciado não existe`
                        );
                    }
                }
            });

            // Validar ações
            if (!rule.actions || rule.actions.length === 0) {
                nodeErrors.push(`Regra ${ruleIndex + 1}: não possui ações`);
            }

            rule.actions?.forEach((action, actionIndex) => {
                if (!action.type) {
                    nodeErrors.push(`Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: tipo não pode estar vazio`);
                }

                // Validar campos específicos por tipo
                if (action.type === "goto") {
                    if (!action.target || action.target.trim() === "") {
                        nodeErrors.push(
                            `Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: stepId não pode estar vazio`
                        );
                    } else {
                        const targetStep = steps.find((s) => s.id === action.target);
                        if (!targetStep) {
                            nodeErrors.push(
                                `Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: stepId referenciado não existe`
                            );
                        }
                    }
                }

                if (action.type === "setVariable" && (!action.target || action.target.trim() === "")) {
                    nodeErrors.push(
                        `Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: nome da variável não pode estar vazio`
                    );
                }

                if (action.type === "score" && typeof action.value !== "number") {
                    nodeErrors.push(
                        `Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: valor deve ser um número`
                    );
                }

                if (action.type === "message" && (!action.value || typeof action.value !== "string")) {
                    nodeErrors.push(
                        `Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: mensagem não pode estar vazia`
                    );
                }

                if (action.type === "redirect" && (!action.value || typeof action.value !== "string")) {
                    nodeErrors.push(
                        `Regra ${ruleIndex + 1}, Ação ${actionIndex + 1}: URL não pode estar vazia`
                    );
                }
            });
        });

        if (nodeErrors.length > 0) {
            errors.push({
                type: "rule",
                nodeId: node.id,
                message: nodeErrors.join("; "),
                severity: "error",
            });
        }
    });
}

/**
 * Validações de conexões
 */
function validateConnections(
    nodes: FlowNode[],
    edges: FlowEdge[],
    errors: ValidationError[],
    warnings: ValidationError[]
) {
    // Verificar se edges referenciam nodes existentes
    edges.forEach((edge) => {
        const sourceExists = nodes.some((node) => node.id === edge.source);
        const targetExists = nodes.some((node) => node.id === edge.target);

        if (!sourceExists) {
            errors.push({
                type: "connection",
                edgeId: edge.id,
                message: `Edge referencia source node inexistente: ${edge.source}`,
                severity: "error",
            });
        }

        if (!targetExists) {
            errors.push({
                type: "connection",
                edgeId: edge.id,
                message: `Edge referencia target node inexistente: ${edge.target}`,
                severity: "error",
            });
        }
    });

    // Verificar loops básicos (se um node aponta para si mesmo)
    edges.forEach((edge) => {
        if (edge.source === edge.target) {
            warnings.push({
                type: "connection",
                edgeId: edge.id,
                message: "Edge cria loop (node conectado a si mesmo)",
                severity: "warning",
            });
        }
    });
}

/**
 * Aplica erros de validação aos nodes
 */
export function applyValidationErrors(
    nodes: FlowNode[],
    validationResult: FlowValidationResult
): FlowNode[] {
    return nodes.map((node) => {
        const nodeErrors = validationResult.errors
            .filter((error) => error.nodeId === node.id)
            .map((error) => error.message);

        return {
            ...node,
            data: {
                ...node.data,
                validationErrors: nodeErrors,
            },
        };
    });
}

/**
 * Aplica erros de validação às edges
 */
export function applyValidationErrorsToEdges(
    edges: FlowEdge[],
    validationResult: FlowValidationResult
): FlowEdge[] {
    return edges.map((edge) => {
        const edgeErrors = validationResult.errors
            .filter((error) => error.edgeId === edge.id)
            .map((error) => error.message);

        return {
            ...edge,
            data: {
                type: edge.data?.type || "sequential", // Garantir que type sempre está definido
                ...edge.data,
                validationErrors: edgeErrors,
            },
        };
    });
}
