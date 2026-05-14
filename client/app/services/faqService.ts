import apiClient from './apiClient';
import { API_ROUTES } from './apiRoutes';

export interface FaqItem {
    _id: string;
    question: string;
    answer: string;
    status?: boolean | string;
    createdAt?: string;
    updatedAt?: string;
}

interface FaqListResponse {
    status: number;
    message: string;
    data: FaqItem[];
}

interface FaqCreateResponse {
    status: number;
    message: string;
    data?: FaqItem;
}

interface FaqSingleResponse {
    status: number;
    message: string;
    data?: FaqItem;
}

export const faqService = {
    getAll: async (): Promise<FaqListResponse> => {
        const response = await apiClient.get(API_ROUTES.FAQ.ALL);
        return response.data;
    },

    create: async (payload: { question: string; answer: string }): Promise<FaqCreateResponse> => {
        const response = await apiClient.post(API_ROUTES.FAQ.CREATE, payload);
        return response.data;
    },

    getById: async (id: string): Promise<{ status: number; message: string; data: FaqItem }> => {
        const response = await apiClient.get(`${API_ROUTES.FAQ.BY_ID}/${id}`);
        return response.data;
    },

    update: async (id: string, payload: { question: string; answer: string }): Promise<FaqSingleResponse> => {
        const response = await apiClient.put(`${API_ROUTES.FAQ.BY_ID}/${id}`, payload);
        return response.data;
    },

    remove: async (id: string): Promise<{ status: number; message: string }> => {
        const response = await apiClient.delete(`${API_ROUTES.FAQ.BY_ID}/${id}`);
        return response.data;
    },
};
