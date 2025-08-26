import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/auth`
    : `${import.meta.env.VITE_API_BASE_URL}/auth`; // Remove localhost reference

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000, // 10 second timeout
});

// Request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Response error:', error);
        
        if (error.code === 'ECONNREFUSED') {
            error.message = 'Cannot connect to server. Please ensure the backend is running on port 8080.';
        } else if (error.code === 'ETIMEDOUT') {
            error.message = 'Request timed out. Please check your internet connection.';
        } else if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else if (error.response.status === 404) {
                error.message = 'API endpoint not found. Please check server configuration.';
            } else if (error.response.status >= 500) {
                error.message = 'Server error. Please try again later.';
            }
        } else if (error.request) {
            error.message = 'Network error. Please check your connection and try again.';
        }
        
        return Promise.reject(error);
    }
);

export default api;
