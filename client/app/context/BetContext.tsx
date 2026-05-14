'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Match } from '../components/sports/MatchesTable';

export interface BetSelection {
    match: Match;
    type: 'home' | 'draw' | 'away';
    odds: string;
}

interface BetContextType {
    selectedBet: BetSelection | null;
    isBetSlipOpen: boolean;
    openBetSlip: (bet: BetSelection) => void;
    closeBetSlip: () => void;
    removeBet: () => void;
}

const BetContext = createContext<BetContextType | undefined>(undefined);

export function BetProvider({ children }: { children: ReactNode }) {
    const [selectedBet, setSelectedBet] = useState<BetSelection | null>(null);
    const [isBetSlipOpen, setIsBetSlipOpen] = useState(false);

    const openBetSlip = (bet: BetSelection) => {
        setSelectedBet(bet);
        setIsBetSlipOpen(true);
    };

    const closeBetSlip = () => {
        setIsBetSlipOpen(false);
    };

    const removeBet = () => {
        setSelectedBet(null);
    };

    return (
        <BetContext.Provider
            value={{
                selectedBet,
                isBetSlipOpen,
                openBetSlip,
                closeBetSlip,
                removeBet,
            }}
        >
            {children}
        </BetContext.Provider>
    );
}

export function useBet() {
    const context = useContext(BetContext);
    if (context === undefined) {
        throw new Error('useBet must be used within a BetProvider');
    }
    return context;
}
