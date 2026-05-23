'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DollarSign, PoundSterling, Euro } from 'lucide-react';
import axios from 'axios';
import { API_ROUTES } from '../services/apiRoutes';

export interface CurrencyItem {
    code: string;
    symbol: string;
    label: string;
    icon: React.ElementType;
}

export const CURRENCIES: CurrencyItem[] = [
    { code: 'USD', symbol: '$', label: 'US Dollar', icon: DollarSign },
    { code: 'GBP', symbol: '£', label: 'British Pound', icon: PoundSterling },
    { code: 'EUR', symbol: '€', label: 'Euro', icon: Euro },
];

interface CurrencyContextType {
    selectedCurrency: CurrencyItem;
    conversionRate: number;
    isConverting: boolean;
    setSelectedCurrency: (currency: CurrencyItem) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItem>(CURRENCIES[0]);
    const [conversionRate, setConversionRate] = useState(1);
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        const fetchRate = async () => {
            const targetCode = selectedCurrency.code.toLowerCase();

            if (targetCode === 'usd') {
                setConversionRate(1);
                setIsConverting(false);
                return;
            }

            setIsConverting(true);
            try {
                const response = await axios.get(API_ROUTES.CURRENCY.FALLBACK_LATEST);
                const rate = Number(response.data.usd[targetCode]);

                if (!Number.isFinite(rate) || rate <= 0) {
                    throw new Error('Invalid conversion rate');
                }

                if (!isCancelled) {
                    setConversionRate(rate);
                }
            } catch {
                if (!isCancelled) {
                    setConversionRate(1);
                }
            } finally {
                if (!isCancelled) {
                    setIsConverting(false);
                }
            }
        };

        fetchRate();

        return () => {
            isCancelled = true;
        };
    }, [selectedCurrency.code]);

    return (
        <CurrencyContext.Provider value={{ selectedCurrency, conversionRate, isConverting, setSelectedCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency(): CurrencyContextType {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
    return ctx;
}
