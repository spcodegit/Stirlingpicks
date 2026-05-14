import axios from 'axios';

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4700').replace(/\/$/, '');
const BASE_URL = apiBaseUrl.endsWith('/api') ? apiBaseUrl : `${apiBaseUrl}/api`;

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        // If the backend returns a custom status >= 400 within a 200 OK response
        if (response.data && response.data.status >= 400) {
            return Promise.reject({
                response: response
            });
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;

