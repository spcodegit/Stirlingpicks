import apiClient from './apiClient';
import { API_ROUTES } from './apiRoutes';

export interface SupportUser {
    _id: string;
    name: string;
    email: string;
}

export interface SupportItem {
    _id: string;
    userId: string | SupportUser;
    message: string;
    status: 'placed' | 'pending' | 'complete' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

interface SupportAllResponse {
    status: number;
    message: string;
    data: {
        data: SupportItem[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

interface SupportByIdResponse {
    status: number;
    message: string;
    data: SupportItem;
}

export const supportService = {
    create: async (data: { message: string }) => {
        const response = await apiClient.post(API_ROUTES.SUPPORT.CREATE, data);
        return response.data;
    },

    getAll: async (
        page: number = 1,
        limit: number = 20,
        filters?: { id?: string }
    ): Promise<SupportAllResponse> => {
        const params: Record<string, string | number> = { page, limit };
        if (filters?.id) params.id = filters.id;
        const response = await apiClient.get(API_ROUTES.SUPPORT.ALL, { params });
        return response.data;
    },

    getById: async (id: string): Promise<SupportByIdResponse> => {
        const response = await apiClient.get(`${API_ROUTES.SUPPORT.BY_ID}/${id}`);
        return response.data;
    },

    update: async (id: string, data: { status: string }) => {
        const response = await apiClient.put(`${API_ROUTES.SUPPORT.UPDATE}/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`${API_ROUTES.SUPPORT.DELETE}/${id}`);
        return response.data;
    },
};
