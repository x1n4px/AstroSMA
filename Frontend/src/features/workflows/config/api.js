const API_BASE_URL = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');

let cachedClientConfig = null;
let configPromise = null;

export const API_ENDPOINTS = {
    workflows: {
        runQuery: `${API_BASE_URL}/workflows/runQuery`,
        runPredefinedQuery: `${API_BASE_URL}/workflows/runPredefinedQuery`,
        publishToWordPress: `${API_BASE_URL}/workflows/publish-to-wordpress`,
        wordPressStatus: `${API_BASE_URL}/workflows/wordpress-status`
    },
    views: {
        getAll: `${API_BASE_URL}/views`,
        getByName: name => `${API_BASE_URL}/views/${name}`,
        getById: id => `${API_BASE_URL}/views/${id}`,
        create: `${API_BASE_URL}/views`,
        update: id => `${API_BASE_URL}/views/${id}`,
        delete: name => `${API_BASE_URL}/views/${name}`,
        import: `${API_BASE_URL}/views/import`,
        sync: `${API_BASE_URL}/views/sync`,
        stats: `${API_BASE_URL}/views/stats`
    },
    auxiliary: {
        clientConfig: `${API_BASE_URL}/auxiliary/client-config`
    }
};

export const getClientRuntimeConfig = async () => {
    if (cachedClientConfig) {
        return cachedClientConfig;
    }

    if (!configPromise) {
        configPromise = fetchApi(API_ENDPOINTS.auxiliary.clientConfig, { method: 'GET' })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Unable to fetch runtime config: ${response.status}`);
                }
                const data = await response.json();
                cachedClientConfig = {
                    youtubeApiKey: data?.youtubeApiKey || '',
                    youtubeClientId: data?.youtubeClientId || ''
                };
                return cachedClientConfig;
            })
            .finally(() => {
                configPromise = null;
            });
    }

    return configPromise;
};

export const buildQueryUrl = (endpoint, params = {}) => {
    const url = new URL(endpoint, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            url.searchParams.append(key, value);
        }
    });
    return url.toString();
};

export const getAuthHeaders = (headers = {}) => {
    const authHeaders = new Headers(headers);
    const token = localStorage.getItem('authToken');

    if (token && !authHeaders.has('Authorization')) {
        authHeaders.set('Authorization', `Bearer ${token}`);
    }

    return authHeaders;
};

export const fetchApi = (input, init = {}) => {
    const headers = getAuthHeaders(init.headers);
    const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

    if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(input, {
        ...init,
        headers
    });
};

export const validateEnvironmentConfig = () => {
    const missingVars = [];

    if (missingVars.length > 0) {
        console.warn('Missing required workflow environment variables:', missingVars);
    }

    return missingVars.length === 0;
};

validateEnvironmentConfig();
