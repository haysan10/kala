import api from './api';
import { User } from '../types';

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<{ success: boolean; data: AuthResponse }>('/api/v1/auth/login', credentials);
        const authData = response.data.data;
        if (authData.token) {
            localStorage.setItem('kala_token', authData.token);
            localStorage.setItem('kala_user', JSON.stringify(authData.user));
        }
        return authData;
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<{ success: boolean; data: AuthResponse }>('/api/v1/auth/register', data);
        const authData = response.data.data;
        if (authData.token) {
            localStorage.setItem('kala_token', authData.token);
            localStorage.setItem('kala_user', JSON.stringify(authData.user));
        }
        return authData;
    },

    async getMe(): Promise<User> {
        const response = await api.get<{ success: boolean; data: User }>('/api/v1/auth/me');
        const user = response.data.data;
        localStorage.setItem('kala_user', JSON.stringify(user));
        return user;
    },


    logout() {
        localStorage.removeItem('kala_token');
        localStorage.removeItem('kala_user');
    },

    getCurrentUser(): User | null {
        const user = localStorage.getItem('kala_user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('kala_token');
    }
};
