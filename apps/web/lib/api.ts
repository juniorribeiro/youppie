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
            
            // NestJS pode colocar o objeto dentro de message quando é BadRequestException
            const errorData = typeof error.message === 'object' ? error.message : error;
            
            const apiError: any = new Error(errorData.message || error.message || 'API Error');
            apiError.code = errorData.code || error.code;
            apiError.currentPlan = errorData.currentPlan || error.currentPlan;
            apiError.limit = errorData.limit || error.limit;
            console.log("API Error criado:", { code: apiError.code, message: apiError.message });
            throw apiError;
        }

        const result = await res.json();
        return result;
    } catch (error: any) {
        throw error;
    }
}
