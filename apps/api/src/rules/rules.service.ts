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
     * Suporta arrays para múltipla escolha
     */
    private compareValues(left: any, operator: string, right: any): boolean {
        // Converter para arrays para facilitar comparação
        const leftArray = Array.isArray(left) ? left : (left !== undefined && left !== null ? [left] : []);
        const rightArray = Array.isArray(right) ? right : (right !== undefined && right !== null ? [right] : []);

        // Arrays vazios retornam false para comparações
        if (leftArray.length === 0 && operator !== '==') {
            return false;
        }

        switch (operator) {
            case '==':
                // Para arrays: verificar se algum valor do left está no right
                if (Array.isArray(left) || Array.isArray(right)) {
                    return leftArray.some(l => rightArray.includes(l));
                }
                return left == right; // Use == para permitir coerção de tipo
            case '!=':
                // Para arrays: verificar se nenhum valor do left está no right
                if (Array.isArray(left) || Array.isArray(right)) {
                    return !leftArray.some(l => rightArray.includes(l));
                }
                return left != right;
            case '>':
                // Para operadores numéricos, usar primeiro valor se for array
                const leftNum = Array.isArray(left) ? Number(left[0]) : Number(left);
                const rightNum = Array.isArray(right) ? Number(right[0]) : Number(right);
                if (isNaN(leftNum) || isNaN(rightNum)) return false;
                return leftNum > rightNum;
            case '<':
                const leftNumLt = Array.isArray(left) ? Number(left[0]) : Number(left);
                const rightNumLt = Array.isArray(right) ? Number(right[0]) : Number(right);
                if (isNaN(leftNumLt) || isNaN(rightNumLt)) return false;
                return leftNumLt < rightNumLt;
            case '>=':
                const leftNumGte = Array.isArray(left) ? Number(left[0]) : Number(left);
                const rightNumGte = Array.isArray(right) ? Number(right[0]) : Number(right);
                if (isNaN(leftNumGte) || isNaN(rightNumGte)) return false;
                return leftNumGte >= rightNumGte;
            case '<=':
                const leftNumLte = Array.isArray(left) ? Number(left[0]) : Number(left);
                const rightNumLte = Array.isArray(right) ? Number(right[0]) : Number(right);
                if (isNaN(leftNumLte) || isNaN(rightNumLte)) return false;
                return leftNumLte <= rightNumLte;
            case 'in':
                // left deve estar completamente no array right
                if (!Array.isArray(right)) {
                    return false;
                }
                // Se left é array, todos os valores devem estar em right
                if (Array.isArray(left)) {
                    return leftArray.every(l => rightArray.includes(l));
                }
                // Se left é valor único, deve estar em right
                return rightArray.includes(left);
            case 'notIn':
                // left não deve estar no array right
                if (!Array.isArray(right)) {
                    return true; // Se right não é array, left não está nele
                }
                // Se left é array, nenhum valor deve estar em right
                if (Array.isArray(left)) {
                    return !leftArray.some(l => rightArray.includes(l));
                }
                // Se left é valor único, não deve estar em right
                return !rightArray.includes(left);
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
