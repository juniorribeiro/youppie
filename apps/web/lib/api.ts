const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

interface FetchOptions extends RequestInit {
    token?: string;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
            ...rest,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            console.log("Erro da API:", error);
            
            // NestJS pode retornar message como string ou array de objetos
            let errorMessage = 'Erro desconhecido';
            
            if (typeof error.message === 'string') {
                errorMessage = error.message;
            } else if (Array.isArray(error.message)) {
                // Se for array de erros de validação
                errorMessage = error.message
                    .map((err: any) => {
                        if (typeof err === 'string') return err;
                        if (err?.constraints) {
                            return Object.values(err.constraints).join(', ');
                        }
                        return err?.message || JSON.stringify(err);
                    })
                    .join('; ');
            } else if (error.message && typeof error.message === 'object') {
                // Se message for um objeto com errors
                if (Array.isArray(error.message.errors)) {
                    errorMessage = error.message.errors
                        .map((e: any) => e.constraints?.join(', ') || e.field)
                        .join('; ');
                } else {
                    errorMessage = error.message.message || JSON.stringify(error.message);
                }
            } else if (error.errors && Array.isArray(error.errors)) {
                errorMessage = error.errors
                    .map((e: any) => e.constraints?.join(', ') || e.field)
                    .join('; ');
            }
            
            const apiError: any = new Error(errorMessage);
            apiError.code = error.code;
            apiError.currentPlan = error.currentPlan;
            apiError.limit = error.limit;
            // Preservar erros de validação estruturados se existirem
            if (error.errors && Array.isArray(error.errors)) {
                apiError.errors = error.errors;
            } else if (error.message && Array.isArray(error.message)) {
                // Se message for array de erros (formato alternativo do ValidationPipe)
                apiError.errors = error.message.map((err: any) => ({
                    field: err.property || err.field,
                    constraints: err.constraints ? Object.values(err.constraints) : [],
                }));
            }
            console.log("API Error criado:", { code: apiError.code, message: apiError.message });
            throw apiError;
        }

        const result = await res.json();
        return result;
    } catch (error: any) {
        throw error;
    }
}
