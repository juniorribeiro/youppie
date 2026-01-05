const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

interface FetchOptions extends RequestInit {
    token?: string;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;

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
        throw new Error(error.message || 'API Error');
    }

    return res.json();
}
