/**
 * API Base URL Configuration
 *
 * In DEVELOPMENT: Uses '/api' (relative) — Vite proxies this to localhost:5000
 * In PRODUCTION:  Uses VITE_API_URL env var (e.g. https://booknsmash.antigravity.in/api)
 *                 Falls back to '/api' if env var is not set
 */
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * API helper with automatic retry logic for backend connection issues.
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

            // Guard: if the response is HTML instead of JSON, the backend is unreachable
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json') && !response.ok) {
                throw new Error('Backend returned non-JSON response. Is the server running?');
            }

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
            const healthUrl = API_BASE.replace(/\/api\/?$/, '/health');
            const res = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
            return res.ok;
        } catch {
            return false;
        }
    },
};

export default api;
