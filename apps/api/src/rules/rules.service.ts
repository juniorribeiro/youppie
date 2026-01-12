import { Injectable } from '@nestjs/common';
import { ConditionDto, RuleDto, ActionDto } from '../steps/dto/step.dto';

export interface EvaluationContext {
    answers: Record<string, any>; // stepId -> value
    variables: Record<string, any>; // variableName -> value
    currentStepId: string;
}

export interface EvaluationResult {
    matched: boolean;
    actions: ActionDto[];
}

/**
 * Service para avaliação de regras condicionais
 */
@Injectable()
export class RulesService {
    /**
     * Avalia uma condição individual
     */
    evaluateCondition(condition: ConditionDto, context: EvaluationContext): boolean {
        let value: any;

        if (condition.type === 'answer') {
            // Buscar resposta do step
            value = context.answers[condition.source];
        } else if (condition.type === 'variable') {
            // Buscar variável
            value = context.variables[condition.source];
        } else {
            return false;
        }

        // Se valor não existe, condição é falsa
        if (value === undefined || value === null) {
            return false;
        }

        // Avaliar operador
        return this.compareValues(value, condition.operator, condition.value);
    }

    /**
     * Compara valores baseado no operador
     */
    private compareValues(left: any, operator: string, right: any): boolean {
        switch (operator) {
            case '==':
                return left == right; // Use == para permitir coerção de tipo
            case '!=':
                return left != right;
            case '>':
                return Number(left) > Number(right);
            case '<':
                return Number(left) < Number(right);
            case '>=':
                return Number(left) >= Number(right);
            case '<=':
                return Number(left) <= Number(right);
            case 'in':
                if (!Array.isArray(right)) {
                    return false;
                }
                return right.includes(left);
            case 'notIn':
                if (!Array.isArray(right)) {
                    return false;
                }
                return !right.includes(left);
            default:
                return false;
        }
    }

    /**
     * Avalia múltiplas condições com lógica AND ou OR
     */
    evaluateConditions(conditions: ConditionDto[], logic: 'AND' | 'OR' = 'AND', context: EvaluationContext): boolean {
        if (conditions.length === 0) {
            return true;
        }

        if (logic === 'AND') {
            return conditions.every(condition => this.evaluateCondition(condition, context));
        } else {
            return conditions.some(condition => this.evaluateCondition(condition, context));
        }
    }

    /**
     * Avalia array de regras e retorna ações da primeira regra que corresponder
     */
    evaluateRules(rules: RuleDto[], context: EvaluationContext): EvaluationResult {
        // Ordenar regras por priority (menor = primeiro)
        const sortedRules = [...rules].sort((a, b) => {
            const priorityA = a.priority ?? 999;
            const priorityB = b.priority ?? 999;
            return priorityA - priorityB;
        });

        // Avaliar cada regra na ordem
        for (const rule of sortedRules) {
            const logic = rule.logic || 'AND';
            const matched = this.evaluateConditions(rule.conditions, logic, context);

            if (matched) {
                return {
                    matched: true,
                    actions: rule.actions,
                };
            }
        }

        return {
            matched: false,
            actions: [],
        };
    }
}
