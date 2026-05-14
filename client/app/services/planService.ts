import apiClient from './apiClient';
import { API_ROUTES } from './apiRoutes';

export interface PlanRecord {
    _id: string;
    amount: number;
    bettingDays: number;
    minBettingDays: number;
    dailyDrawDownMax: number;
    drawDown: number;
    fee: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePlanDto {
    amount: number;
    bettingDays: number;
    minBettingDays: number;
    dailyDrawDownMax: number;
    drawDown: number;
    fee: number;
}

export const planService = {
    create: async (data: CreatePlanDto) => {
        const response = await apiClient.post(API_ROUTES.PLAN.CREATE, data);
        return response.data;
    },

    getAll: async () => {
        const response = await apiClient.get(API_ROUTES.PLAN.ALL);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get(`${API_ROUTES.PLAN.BY_ID}/${id}`);
        return response.data;
    },

    update: async (id: string, data: Partial<CreatePlanDto>) => {
        const response = await apiClient.put(`${API_ROUTES.PLAN.UPDATE}/${id}`, data);
        return response.data;
    },

    remove: async (id: string) => {
        const response = await apiClient.delete(`${API_ROUTES.PLAN.DELETE}/${id}`);
        return response.data;
    },
};
