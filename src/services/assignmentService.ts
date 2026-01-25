import api from './api';
import { Assignment } from '../types';

export const assignmentService = {
    async getAll(): Promise<Assignment[]> {
        const response = await api.get<{ success: boolean; data: Assignment[] }>('/api/assignments');
        return response.data.data;
    },

    async getById(id: string): Promise<Assignment> {
        const response = await api.get<{ success: boolean; data: Assignment }>(`/api/assignments/${id}`);
        return response.data.data;
    },

    async create(data: Partial<Assignment>): Promise<Assignment> {
        const response = await api.post<{ success: boolean; data: Assignment }>('/api/assignments', data);
        return response.data.data;
    },

    async update(id: string, data: Partial<Assignment>): Promise<Assignment> {
        const response = await api.put<{ success: boolean; data: Assignment }>(`/api/assignments/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/api/assignments/${id}`);
    }
};
