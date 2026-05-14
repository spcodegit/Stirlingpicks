'use client';
import React, { useState } from 'react';
import { X, ChevronDown, Settings, ListFilter, Wallet, AlertCircle, FileText, TrendingUp } from 'lucide-react';
import { useBet } from '../../context/BetContext';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { authService, betService } from '@/app/services';

export default function BetSlip() {
    const { selectedBet, isBetSlipOpen, closeBetSlip, removeBet } = useBet();
    const { user, openLoginModal, login } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [stake, setStake] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'betslip' | 'mybets'>('betslip');

    if (!isBetSlipOpen) return null;

    const getPlacedBetValue = (odds: string) => {
        if (!odds) return 0;
        if (odds.includes('/')) {
            const [numerator, denominator] = odds.split('/').map(Number);
            if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
                return 0;
            }
            return (numerator / denominator) + 1;
        }

        const decimal = parseFloat(odds);
        return Number.isFinite(decimal) ? decimal : 0;
    };

    const handlePlaceBid = async () => {
        setError('');

        if (!user) {
            openLoginModal();
            return;
        }

        const stakeAmount = parseFloat(stake);
        if (isNaN(stakeAmount) || stakeAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        const currentAccountType = user.accountType || 'standard';
        const walletBalance = currentAccountType === 'professional'
            ? Number(user.walletP ?? 0)
            : Number(user.walletS ?? user.balance ?? 0);

        if (walletBalance < stakeAmount) {
            setError('Insufficient funds in wallet');
            setTimeout(() => {
                router.push('/account');
                closeBetSlip();
            }, 1500);
            return;
        }

        if (!selectedBet) {
            setError('Please select a bet first');
            return;
        }

        setLoading(true);
        try {
            const selectedOdds = getPlacedBetValue(selectedBet.odds);

            const slugPart = pathname?.startsWith('/sports/') ? pathname.replace('/sports/', '') : '';
            const inferredSport = slugPart
                ? slugPart.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                : 'Soccer';

            const payload = {
                sport: {
                    name: inferredSport,
                    league: 'General',
                },
                bet: {
                    matchId: selectedBet.match.id,
                    homeTeam: selectedBet.match.homeTeam,
                    awayTeam: selectedBet.match.awayTeam,
                    matchDate: selectedBet.match.dateTime,
                    odds: selectedBet.match.odds,
                },
                placedBet: {
                    name: selectedBet.type,
                    value: Number.isFinite(selectedOdds) ? selectedOdds : 0,
                },
                price: stakeAmount,
            };

            await betService.placeBet(payload);

            // Sync user wallet/balance after successful bet placement.
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const meResponse = await authService.me();
                    const apiUser = meResponse?.data?.user;
                    if (apiUser) {
                        const walletS = Number(apiUser.walletS) || 0;
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
                        login(token, normalizedUser, false);
                    }
                } catch {
                    // Keep flow successful even if wallet refresh fails.
                }
            }

            setStake('');
            removeBet();
            closeBetSlip();
        } catch (err: unknown) {
    let errorMessage = 'Something went wrong';
         if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message?: string | { user?: string } } } };
        const message = axiosError.response?.data?.message;

        errorMessage = typeof message === 'object' 
            ? (message.user || errorMessage) 
            : (message || errorMessage);
    }

    setError(errorMessage);} finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-0 right-4 z-[9999] w-full max-w-[360px] bg-[var(--bg-white)] backdrop-blur-md rounded-t-md overflow-hidden border-t border-[var(--border-light)] flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-5 shadow-2xl">
            {/* Header: Betslip with Collapse */}
            <div className="relative bg-[var(--bg-green-header)] px-4 py-3.5 flex items-center justify-between border-b border-[var(--border-white)]/10">
                {/* Diagonal Background Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage: `linear-gradient(45deg, var(--bg-green-header) 25%, transparent 25%, transparent 50%, var(--bg-green-header) 50%, var(--bg-green-header) 75%, transparent 75%, transparent)`,
                        backgroundSize: '4px 4px'
                    }}
                ></div>

                <span className="relative z-10 text-[var(--bg-navy-secondary)] font-inter font-bold text-[15px] uppercase tracking-wider">Betslip</span>
                <button onClick={closeBetSlip} className="relative z-10 text-[var(--bg-navy-secondary)]/70 hover:text-[var(--bg-navy-secondary)] transition-colors cursor-pointer">
                    <ChevronDown size={22} />
                </button>
            </div>

            {/* Sub Tabs: Quick Bet / Betslip */}
            {/* <div className="bg-[var(--bg-green-primary)] px-4 flex items-center justify-between border-b border-[var(--border-light)]">
                <div className="flex">
                    <button className="py-3 px-1 border-b-2 border-transparent text-[var(--text-black)]/60 text-sm font-medium hover:text-[var(--text-black)] transition-all mr-6 cursor-pointer">
                        Quick Bet
                    </button>
                    <button className="py-3 px-1 border-b-2 border-[var(--text-black)] text-[var(--text-black)] text-sm font-bold transition-all relative cursor-pointer">
                        Betslip
                    </button>
                </div>
                <button className="text-[var(--text-black)]/60 hover:text-[var(--text-black)] transition-colors cursor-pointer">
                    <Settings size={18} />
                </button>
            </div> */}

            {/* Selections Subheader */}
            {/* <div className="bg-[var(--bg-green-primary)] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-[var(--bg-navy-secondary)] text-[var(--bg-green-primary)] text-[10px] font-bold w-4 h-4 rounded-sm flex items-center justify-center">
                        1
                    </div>
                    <span className="text-[var(--text-black)] text-[13px] font-bold font-inter">Selections</span>
                </div>
                <button
                    onClick={removeBet}
                    className="text-[var(--text-black)]/60 text-[12px] font-medium hover:text-[var(--text-black)] transition-colors cursor-pointer"
                >
                    Clear Betslip
                </button>
            </div> */}

            {/* Selection Card */}
            <div className="flex-1 overflow-y-auto max-h-[350px] bg-[var(--bg-white)]">
                {selectedBet ? (
                    <div className="p-4 relative group border-b border-[var(--border-light)]">
                        <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0 pr-8">
                                <h4 className="text-[var(--text-black)] font-inter font-bold text-[15px] mb-0.5 truncate uppercase tracking-tight">
                                    {selectedBet.type === 'home' ? selectedBet.match.homeTeam :
                                        selectedBet.type === 'away' ? selectedBet.match.awayTeam : 'Draw'}
                                </h4>
                                <p className="text-[var(--text-dark-secondary)] font-inter text-[12px]">
                                    90 Minutes - {selectedBet.match.homeTeam} v {selectedBet.match.awayTeam}
                                </p>
                            </div>

                            {/* Odds Badge */}
                            <div className="absolute right-4 top-4">
                                <div className="bg-[var(--bg-navy-secondary)] px-2 py-1 rounded-[2px] shadow-sm">
                                    <span className="text-[var(--bg-green-primary)] font-bold text-[13px]">{selectedBet.odds}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className="mt-6 text-center">
                            <p className="text-[var(--text-dark)] text-[13px] font-bold pb-4 border-b border-[var(--border-light)] opacity-80">
                                The price of your selection has changed
                            </p>
                        </div>

                        {/* Input and Action Button Row */}
                        <div className="mt-4 flex gap-2">
                            <div className="w-[100px] flex-shrink-0 relative">
                                <input
                                    type="text"
                                    placeholder="0.00"
                                    value={stake}
                                    onChange={(e) => setStake(e.target.value)}
                                    className="w-full h-[52px] bg-[var(--bg-white)] text-[var(--text-dark)] font-bold text-center text-lg rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--bg-green-primary)]/50 transition-all placeholder:text-[var(--text-gray-placeholder)] border border-[var(--border-light)]"
                                />
                            </div>
                            <button
                                onClick={handlePlaceBid}
                                disabled={loading}
                                className="flex-1 h-[52px] bg-[var(--bg-navy-secondary)] hover:bg-[var(--bg-navy-primary)] text-[var(--bg-green-primary)] font-bold text-[14px] rounded-sm transition-all active:scale-[0.98] shadow-lg flex items-center justify-center uppercase tracking-wider cursor-pointer"
                            >
                                {loading ? 'Processing...' : 'Accept Price Changes'}
                            </button>
                        </div>

                        {/* Real-time PnL Display */}
                        {stake && parseFloat(stake) > 0 && selectedBet && (
                            <div className="mt-3 bg-[var(--bg-navy-secondary)]/5 border border-[var(--border-light)] rounded-sm px-4 py-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp size={14} className="text-green-600" />
                                        <span className="text-[var(--text-dark-secondary)] text-[11px] font-medium uppercase tracking-wider">Potential Win</span>
                                    </div>
                                    <span className="text-green-600 font-bold text-[15px] font-inter">
                                        £{(parseFloat(stake) * getPlacedBetValue(selectedBet.odds)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-12 px-8 text-center">
                        <div className="mb-4 flex justify-center opacity-30">
                            <FileText size={48} className="text-[var(--text-dark-secondary)]" />
                        </div>
                        <p className="text-[var(--text-dark)] font-inter text-sm font-bold">Your betslip is empty</p>
                        <p className="text-[var(--text-dark-secondary)] font-inter text-[11px] mt-1">Please select an event to place a bet</p>
                    </div>
                )}
            </div>

            {/* Errors */}
            {error && (
                <div className="bg-red-500/10 border-y border-red-500/20 px-4 py-2 flex items-center gap-2 text-red-600 font-bold text-xs">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}

            {/* Bottom Nav: Betslip / My Bets */}
            <div className="bg-[var(--bg-green-primary)] border-t border-[var(--border-light)] grid grid-cols-2">
                <button
                    onClick={() => setActiveTab('betslip')}
                    className={`py-3.5 flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'betslip' ? 'bg-[var(--bg-navy-secondary)]/10' : 'opacity-60 hover:opacity-100'}`}
                >
                    <div className="relative">
                        <FileText size={18} className="text-[var(--text-black)]" />
                        {selectedBet && (
                            <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                                1
                            </div>
                        )}
                    </div>
                    <span className="text-[var(--text-black)] font-bold text-[13px] tracking-tight">Betslip</span>
                </button>
                <button
                    onClick={() => {
                        setActiveTab('mybets');
                        router.push('/bet-history');
                    }}
                    className={`py-3.5 flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'mybets' ? 'bg-[var(--bg-navy-secondary)]/10' : 'opacity-40 hover:opacity-100'}`}
                >
                    <ListFilter size={18} className="text-[var(--text-black)]" />
                    <span className="text-[var(--text-black)] font-bold text-[13px] tracking-tight">My Bets</span>
                </button>
            </div>

            {/* Wallet Info if logged in */}
            {user && (
                <div className="bg-[var(--bg-navy-secondary)] px-4 py-1.5 flex items-center justify-center gap-2 border-t border-[var(--border-white)]/5">
                    <Wallet size={12} className="text-[var(--bg-green-primary)]" />
                    <span className="text-[var(--bg-green-primary)]/80 text-[10px] font-bold tracking-wider uppercase">BALANCE: £{user.balance.toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}
