'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
    id: string;
    name: string;
    email: string;
    address?: string;
    phone?: string;
    age?: number;
    gender?: string;
    balance: number;
    walletS?: number;
    walletP?: number | {
        amount?: number;
        balance?: number;
        bettingDays?: number;
        dailyDrawDown?: number;
        maxDrawDown?: number;
        fee?: number;
    };
    isVerified: boolean;
    role: number;
    accountType?: 'standard' | 'professional';
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

export interface DepositConfig {
    amount: number;
    planId: string;
    accountType: 'standard' | 'professional';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isLoginModalOpen: boolean;
    isSignupModalOpen: boolean;
    isVerifyModalOpen: boolean;
    isDepositModalOpen: boolean;
    depositConfig: DepositConfig | null;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    openSignupModal: () => void;
    closeSignupModal: () => void;
    openVerifyModal: () => void;
    closeVerifyModal: () => void;
    openDepositModal: (config?: DepositConfig) => void;
    closeDepositModal: () => void;
    login: (token: string, userData: User, shouldCloseModals?: boolean) => void;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [depositConfig, setDepositConfig] = useState<DepositConfig | null>(null);

    useEffect(() => {
        const hydrateUser = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (!token) {
                setLoading(false);
                return;
            }

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (_err) {
                    localStorage.removeItem('user');
                }
            }

            try {
                const response = await authService.me();
                const apiUser = response?.data?.user;

                if (apiUser) {
                    const walletS = Number(apiUser.walletS) || 0;
                    // walletP is a plain Number in the DB
                    const walletPVal = Number(apiUser.walletP) || 0;
                    const acctType = apiUser.accountType || 'standard';
                    const normalizedUser = {
                        ...apiUser,
                        id: apiUser._id || apiUser.id,
                        walletS,
                        walletP: walletPVal,
                        balance: acctType === 'professional' ? walletPVal : walletS,
                        isVerified: apiUser.isVerified || false,
                    };

                    localStorage.setItem('user', JSON.stringify(normalizedUser));
                    setUser(normalizedUser);
                }
            } catch (_err) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                document.cookie = "token=; path=/; max-age=0";
                document.cookie = "user_role=; path=/; max-age=0";
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        hydrateUser();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const params = new URLSearchParams(window.location.search);
        const authParam = params.get('auth')?.toLowerCase();
        const walletSPromoCode = params.get('walletS');
        const hasStoredToken = Boolean(localStorage.getItem('token'));

        if (walletSPromoCode) {
            localStorage.setItem('signupWalletSPromoCode', walletSPromoCode);
        }

        if (hasStoredToken) return;

        if (walletSPromoCode || authParam === 'register' || authParam === 'signup') {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
            return;
        }

        if (authParam === 'login') {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
        }
    }, []);

    const login = (token: string, userData: User, shouldCloseModals = true) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        document.cookie = `token=${token}; path=/; max-age=604800`;
        document.cookie = `user_role=${userData.role}; path=/; max-age=604800`;
        setUser(userData);
        if (shouldCloseModals) {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = "token=; path=/; max-age=0";
        document.cookie = "user_role=; path=/; max-age=0";
        setUser(null);
    };

    const updateUser = (data: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...data };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const openLoginModal = () => {
        setIsSignupModalOpen(false);
        setIsLoginModalOpen(true);
    };
    const closeLoginModal = () => setIsLoginModalOpen(false);
    const openSignupModal = () => {
        setIsLoginModalOpen(false);
        setIsSignupModalOpen(true);
    };
    const closeSignupModal = () => setIsSignupModalOpen(false);
    const openVerifyModal = () => setIsVerifyModalOpen(true);
    const closeVerifyModal = () => setIsVerifyModalOpen(false);
    const openDepositModal = (config?: DepositConfig) => {
        if (config) setDepositConfig(config);
        setIsDepositModalOpen(true);
    };
    const closeDepositModal = () => {
        setIsDepositModalOpen(false);
        setDepositConfig(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isLoginModalOpen,
            isSignupModalOpen,
            isVerifyModalOpen,
            isDepositModalOpen,
            depositConfig,
            openLoginModal,
            closeLoginModal,
            openSignupModal,
            closeSignupModal,
            openVerifyModal,
            closeVerifyModal,
            openDepositModal,
            closeDepositModal,
            login,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
