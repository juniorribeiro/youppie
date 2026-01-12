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
        if (value === undefined || value === null) {
            return match;
        }
        
        // Converter para string
        return String(value);
    });
}
