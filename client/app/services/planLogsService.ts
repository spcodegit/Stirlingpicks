import apiClient from './apiClient';
import { API_ROUTES } from './apiRoutes';

export interface PlanLogItem {
    _id: string;
    userId: string;
    orderId: string;
    type: 'plan_purchased' | 'plan_expired' | 'bet_placed' | 'bet_finalized' | 'eligibility_updated';
    message: string;
    meta: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}

interface PlanLogsResponse {
    status: number;
    message: string;
    data: PlanLogItem[];
}

export const planLogsService = {
    getByUserAndOrder: async (userId: string, orderId: string): Promise<PlanLogsResponse> => {
        const response = await apiClient.get(API_ROUTES.PLAN_LOGS.ALL, {
            params: { userId, orderId },
        });
        return response.data;
    },
};
