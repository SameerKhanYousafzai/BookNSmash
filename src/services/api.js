const API_BASE = '/api';

/**
 * API helper with automatic retry logic for backend connection issues.
 * Uses relative URLs (/api/...) which Vite proxies to the backend,
 * eliminating CORS issues entirely.
 */
async function apiFetch(endpoint, options = {}, retries = 3) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        };
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, config);
            return response;
        } catch (error) {
            console.warn(
                `⚠️ API request failed (attempt ${attempt}/${retries}): ${endpoint}`,
                error.message
            );

            if (attempt === retries) {
                throw new Error(
                    'Unable to connect to the server. Please make sure the backend is running.'
                );
            }

            // Wait before retry: 1s, 2s, 3s...
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
    }
}

/**
 * Convenience methods
 */
export const api = {
    get: (endpoint) => apiFetch(endpoint),

    post: (endpoint, body) =>
        apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    put: (endpoint, body) =>
        apiFetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        }),

    delete: (endpoint) =>
        apiFetch(endpoint, { method: 'DELETE' }),

    /**
     * Check if backend is reachable
     */
    healthCheck: async () => {
        try {
            const res = await fetch('/health', { signal: AbortSignal.timeout(3000) });
            return res.ok;
        } catch {
            return false;
        }
    },
};

export default api;
