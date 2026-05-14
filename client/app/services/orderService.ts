import apiClient from './apiClient';
import { API_ROUTES } from './apiRoutes';

export interface OrderUser {
    _id: string;
    name: string;
    email: string;
    role?: number;
    accountType?: string;
}

export interface OrderItem {
    _id: string;
    userId: string | OrderUser;
    customOrderId: string;
    amount: number;
    status: string;
    feedback?: string | null;
    paymentInfo?: {
        pay_currency?: string;
        pay_address?: string;
        pay_amount?: number;
        payin_extra_id?: string;
        price_amount?: number;
        payment_id?: string;
    } | null;
    paymentMethod: string;
    accountType: 'standard' | 'professional';
    createdAt: string;
}

interface OrderAllResponse {
    status: number;
    message: string;
    data: {
        data: OrderItem[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

interface OrderByIdResponse {
    status: number;
    message: string;
    data: OrderItem;
}

export const orderService = {
    getAll: async (
        page: number = 1,
        limit: number = 20,
        filters?: { status?: string; accountType?: string; paymentMethod?: string }
    ): Promise<OrderAllResponse> => {
        const params: Record<string, string | number> = { page, limit };
        if (filters?.status) params.status = filters.status;
        if (filters?.accountType) params.accountType = filters.accountType;
        if (filters?.paymentMethod) params.paymentMethod = filters.paymentMethod;
        const response = await apiClient.get(API_ROUTES.ORDER.ALL, { params });
        return response.data;
    },

    getById: async (id: string): Promise<OrderByIdResponse> => {
        const response = await apiClient.get(`${API_ROUTES.ORDER.BY_ID}/${id}`);
        return response.data;
    },
};

