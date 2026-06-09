import apiClient from './apiClient';
import { API_ROUTES } from './apiRoutes';

export interface PayoutUser {
    _id: string;
    name: string;
    email: string;
    role?: number;
    phone?: string;
    address?: string;
    accountType?: string;
    payOutCrypto?: {
        token?: string | null;
        memoTag?: string | null;
        address?: string | null;
    };
    payOutBank?: {
        beneficiaryName?: string | null;
        bankName?: string | null;
        accountNumber?: string | null;
        iban?: string | null;
        accountType?: string | null;
        swiftCode?: string | null;
        routingNumber?: string | null;
    };
}

export interface PayoutItem {
    _id: string;
    userId: string | PayoutUser;
    amount: number;
    currency?: 'USD' | 'GBP' | 'EUR';
    accountType: 'standard' | 'professional';
    type: 'crypto' | 'bank';
    status: 'placed' | 'pending' | 'complete' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface CreatePayoutRequest {
    amount: number;
    currency: 'USD' | 'GBP' | 'EUR';
    accountType: 'standard' | 'professional';
    type: 'crypto' | 'bank';
    payOutBank?: {
        beneficiaryName?: string;
        bankName?: string;
        accountNumber?: string;
        iban?: string;
        accountType?: string;
        swiftCode?: string;
        routingNumber?: string;
    };
}

interface PayoutAllResponse {
    status: number;
    message: string;
    data: {
        data: PayoutItem[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

interface PayoutByIdResponse {
    status: number;
    message: string;
    data: PayoutItem;
}

export const payoutService = {
    create: async (data: CreatePayoutRequest) => {
        const response = await apiClient.post(API_ROUTES.PAYOUT.CREATE, data);
        return response.data;
    },

    getAll: async (
        page: number = 1,
        limit: number = 20,
        filters?: { amount?: number; accountType?: string; type?: string; status?: string }
    ): Promise<PayoutAllResponse> => {
        const params: Record<string, string | number> = { page, limit };
        if (filters?.amount) params.amount = filters.amount;
        if (filters?.accountType) params.accountType = filters.accountType;
        if (filters?.type) params.type = filters.type;
        if (filters?.status) params.status = filters.status;
        const response = await apiClient.get(API_ROUTES.PAYOUT.ALL, { params });
        return response.data;
    },

    getById: async (id: string): Promise<PayoutByIdResponse> => {
        const response = await apiClient.get(`${API_ROUTES.PAYOUT.BY_ID}/${id}`);
        return response.data;
    },

    update: async (id: string, data: { status: string }) => {
        const response = await apiClient.put(`${API_ROUTES.PAYOUT.UPDATE}/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`${API_ROUTES.PAYOUT.DELETE}/${id}`);
        return response.data;
    },
};
