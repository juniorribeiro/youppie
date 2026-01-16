import { Node, Edge } from "@xyflow/react";

/**
 * Tipos de steps do quiz
 */
export type StepType = "QUESTION" | "TEXT" | "CAPTURE" | "RESULT" | "INPUT";

/**
 * Dados de um step completo (vindo da API)
 */
export interface StepDetail {
    id: string;
    title: string;
    description: string | null;
    type: StepType;
    image_url: string | null;
    order: number;
    metadata?: {
        cta_text?: string;
        cta_link?: string;
        variableName?: string;
        inputType?: "text" | "number" | "email";
        captureFields?: {
            name?: boolean;
            email?: boolean;
            phone?: boolean;
        };
        multipleChoice?: boolean;
        minSelections?: number;
        maxSelections?: number;
        rules?: Rule[];
        [key: string]: any;
    };
    question?: {
        id: string;
        text: string;
        options: Array<{
            id?: string;
            text: string;
            value: string;
        }>;
    };
}

/**
 * Step simplificado (lista)
 */
export interface Step {
    id: string;
    title: string;
    type: StepType;
    order: number;
}

/**
 * Regra condicional
 */
export interface Rule {
    id: string;
    priority: number;
    logic: "AND" | "OR";
    conditions: Condition[];
    actions: Action[];
}

/**
 * Condição de uma regra
 */
export interface Condition {
    type: "answer" | "variable";
    source: string; // stepId para answer, nome da variável para variable
    operator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "notIn";
    value: any;
}

/**
 * Ação de uma regra
 */
export interface Action {
    type: "goto" | "skip" | "score" | "setVariable" | "message" | "redirect" | "end";
    target?: string; // stepId para goto, nome da variável para setVariable
    value?: any; // valor para score, message, redirect, skip
}

/**
 * Dados customizados de um node no React Flow
 */
export interface FlowNodeData {
    step: StepDetail;
    label?: string;
    hasRules?: boolean;
    validationErrors?: string[];
    [key: string]: unknown; // Assinatura de índice para compatibilidade com Record<string, unknown>
}

/**
 * Dados customizados de uma edge no React Flow
 */
export interface FlowEdgeData {
    type: "sequential" | "conditional" | "reference";
    ruleId?: string; // ID da regra que gerou esta edge
    condition?: Condition; // Condição resumida
    label?: string;
    validationErrors?: string[];
    // Campos para edges de referência
    referencedStepId?: string; // Step referenciado na condição
    referencedStepTitle?: string; // Título do step referenciado (para exibição)
    conditionType?: "answer" | "variable"; // Tipo da condição
    conditionSource?: string; // Source da condição (stepId ou variável)
    conditionOperator?: string; // Operador da condição
    conditionValue?: any; // Valor da condição
    [key: string]: unknown; // Assinatura de índice para compatibilidade com Record<string, unknown>
}

/**
 * Tipos de nodes do React Flow
 */
export type FlowNodeType = "question" | "text" | "capture" | "result" | "input" | "default";

/**
 * Node customizado do React Flow
 */
export type FlowNode = Node<FlowNodeData, FlowNodeType>;

/**
 * Edge customizada do React Flow
 */
export type FlowEdge = Edge<FlowEdgeData>;

/**
 * Layout persistido do flow
 */
export interface FlowLayout {
    nodes: Array<{
        id: string;
        x: number;
        y: number;
    }>;
    version: string;
}

/**
 * Resultado de validação
 */
export interface FlowValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

/**
 * Erro de validação
 */
export interface ValidationError {
    type: "structural" | "rule" | "connection";
    nodeId?: string;
    edgeId?: string;
    message: string;
    severity: "error" | "warning";
}

/**
 * Aviso de validação
 */
export interface ValidationWarning {
    nodeId?: string;
    edgeId?: string;
    message: string;
}
