/**
 * Utilitário para interpolação de variáveis em textos
 * Substitui {{variável}} por valores correspondentes
 */

export function interpolateText(text: string | null | undefined, variables: Record<string, any>): string {
    if (!text) {
        return '';
    }

    return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        const value = variables[variableName];
        
        // Se a variável não existir, retorna a string original ({{variável}})
        // ou pode retornar string vazia dependendo do comportamento desejado
        if (value === undefined || value === null) {
            return match; // Mantém {{variável}} se não encontrada
        }
        
        // Converter para string
        return String(value);
    });
}

/**
 * Extrai todas as variáveis mencionadas em um texto
 */
export function extractVariables(text: string | null | undefined): string[] {
    if (!text) {
        return [];
    }

    const matches = text.match(/\{\{(\w+)\}\}/g);
    if (!matches) {
        return [];
    }

    return matches.map(match => match.replace(/\{\{|\}\}/g, ''));
}
