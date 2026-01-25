import axios from 'axios';

const API_URL = ''; // Relative path for Next.js

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('kala_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('kala_token');
            localStorage.removeItem('kala_user');
            // Check if we are in browser environment before redirecting
            if (typeof window !== 'undefined') {
                 // Optional: don't redirect if already on landing/auth to avoid loops
                 if (window.location.pathname !== '/') {
                     window.location.href = '/'; 
                 }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
