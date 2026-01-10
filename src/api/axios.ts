import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Env var recommended in prod
    withCredentials: true, // Crucial for sending cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            // Prevent infinite loop: Don't try to refresh if the failed request was ALREADY for login
            if (originalRequest.url === '/auth/login' || originalRequest.url?.includes('/auth/login')) {
                 return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const { data } = await api.post('/auth/refresh');

                // If the refresh token returns an access token, update default header
                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed (token expired), redirect to login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        // Handle Account Deactivation
        if (error.response.status === 403 && error.response.data?.message === 'Account Deactivated') {
             window.location.href = `/deactivated?reason=${encodeURIComponent(error.response.data.reason || '')}`;
        }
        
        return Promise.reject(error);
    }
);

export default api;
