import apiClient from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Generic API response wrapper matching the backend envelope
export interface ApiResponse<T> {
    status: number;
    message: string | { user?: string; system?: string };
    data: T;
}

export interface PaymentCurrency {
    id: string;
    ticker: string;
    name: string;
    logo: string;
}

export interface CreatePaymentRequest {
    amount: number;
    currency: string;
    accountType: 'standard' | 'professional';
    paymentMethod?: string;
    planId?: string;
}

export interface CreatePaymentResponse {
    payment_id: string;
    payment_status: string;
    pay_address: string;
    price_amount: number;
    price_currency: string;
    pay_amount: number;
    pay_currency: string;
    order_id: string;
    order_description: string;
    ipn_callback_url: string;
    created_at: string;
    updated_at: string;
    purchase_id: string;
}

export interface PaymentInfo {
    payment_id: string;
    pay_address: string;
    pay_amount: number;
    pay_currency: string;
    payin_extra_id?: string;
    price_amount: number;
    order_id: string;
}

export interface CreatePaymentResultData {
    paymentInfo: PaymentInfo;
    customOrderId?: string;
    amount?: number;
}

export interface PaymentStatusResponse {
    payment_id: string;
    payment_status: string;
    order_id: string;
    pay_amount?: number;
    price_amount?: number;
}

export interface WebhookPayload {
    actually_paid: number;
    order_id: string;
    pay_amount: number;
    payment_status: string;
    price_amount: number;
    skip?: boolean;
}

export interface AdminCountersGroup {
    total: number;
    [key: string]: number;
}

export interface AdminCountersFinance {
    totalDeposit: number;
    totalBetAmount: number;
    totalPnl: number;
    companyProfit: number;
}

export interface AdminCountersData {
    users: {
        total: number;
    };
    tickets: AdminCountersGroup;
    payouts: AdminCountersGroup;
    orders: AdminCountersGroup;
    bets: AdminCountersGroup;
    finance: AdminCountersFinance;
}

export interface AdminCountersResponse {
    status: number;
    message: string;
    data: AdminCountersData;
}



export interface AdminUserRecord {
    _id: string;
    name: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    address: string;
    picture?: string;
    role: number;
    type: string;
    accountType: 'standard' | 'professional';
    isVerified: boolean;
    walletS?: number;
    walletP?: number;
    createdAt: string;
    updatedAt: string;
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

export interface AdminUsersPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminUsersResponse {
    status: number;
    message: string;
    data: {
        users: AdminUserRecord[];
        pagination: AdminUsersPagination;
    };
}

export const authService = {
    login: async (credentials: Record<string, unknown>) => {
        const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, credentials);
        return response.data;
    },
    register: async (userData: Record<string, unknown>) => {
        const response = await apiClient.post(API_ROUTES.AUTH.REGISTER, userData);
        return response.data;
    },
    forgotPassword: async (email: string) => {
        const response = await apiClient.post(API_ROUTES.AUTH.FORGOT, { email });
        return response.data;
    },
    verifyEmail: async (code: string) => {
        const response = await apiClient.get(`${API_ROUTES.AUTH.VERIFY_EMAIL}?code=${code}`);
        return response.data;
    },
    me: async () => {
        const response = await apiClient.get(API_ROUTES.AUTH.ME);
        return response.data;
    },
    adminCounters: async (): Promise<AdminCountersResponse> => {
        const response = await apiClient.get(API_ROUTES.AUTH.ADMIN_COUNTERS);
        return response.data;
    },
    allUsers: async (
        params?: {
            page?: number;
            limit?: number;
            id?: string;
            status?: string;
            email?: string;
            phone?: string;
            age?: number;
            gender?: string;
        }
    ): Promise<AdminUsersResponse> => {
        const response = await apiClient.get(API_ROUTES.AUTH.USERS, { params });
        return response.data;
    },
    updateProfile: async (
        id: string,
        payload: Record<string, unknown>
    ) => {
        const response = await apiClient.put(`${API_ROUTES.AUTH.UPDATE}/${id}`, payload);
        return response.data;
    },
    changePassword: async (payload: { oldPassword: string; newPassword: string }) => {
        const response = await apiClient.put(API_ROUTES.AUTH.CHANGE_PASSWORD, payload);
        return response.data;
    },
    adminToggleVerify: async (userId: string, isVerified: boolean) => {
        const response = await apiClient.put(`/auth/user/${userId}/verify`, { isVerified });
        return response.data;
    },
    changeAccountType: async (accountType: 'standard' | 'professional') => {
        const response = await apiClient.put(API_ROUTES.AUTH.ACCOUNT_CHANGE, { accountType });
        return response.data;
    },
};


export const nowPaymentService = {
    selectedCurrencies: async (): Promise<ApiResponse<{ selectedCurrencies: string[] }>> => {
        const response = await apiClient.get(API_ROUTES.PAYMENT.SELECTED_CURRENCIES);
        return response.data;
    },
    allCurrencies: async (): Promise<ApiResponse<{ currencies: string[] }>> => {
        const response = await apiClient.get(API_ROUTES.PAYMENT.ALL_CURRENCIES);
        return response.data;
    },
    createPayment: async (data: CreatePaymentRequest): Promise<ApiResponse<CreatePaymentResultData>> => {
        const response = await apiClient.post(API_ROUTES.PAYMENT.CREATE_PAYMENT, data);
        return response.data;
    },
    paymentStatus: async (id: string): Promise<ApiResponse<PaymentStatusResponse>> => {
        const response = await apiClient.get(`${API_ROUTES.PAYMENT.PAYMENT_STATUS}/${id}`);
        return response.data;
    },
    webhook: async (payload: WebhookPayload): Promise<ApiResponse<unknown>> => {
        const response = await apiClient.post(API_ROUTES.PAYMENT.WEBHOOK, payload);
        return response.data;
    },
};
