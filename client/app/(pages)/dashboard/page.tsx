'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    CircleDollarSign,
    Eye,
    Loader2,
    LockKeyhole,
    ReceiptText,
    RefreshCcw,
    ShieldAlert,
    Ticket,
    TrendingDown,
    TrendingUp,
    UserRound,
    Wallet,
    X,
} from 'lucide-react';
import { authService, AdminCountersData } from '@/app/services';
import { useAuth } from '@/app/context/AuthContext';

interface StatusModalState {
    title: string;
    group: Record<string, number>;
}

interface CounterCard {
    key: string;
    label: string;
    value: number;
    icon: React.ReactNode;
    iconBg: string;
    statusGroup?: Record<string, number>;
}

const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);

const getStatusRows = (group: Record<string, number>, includeTotal: boolean = false) =>
    Object.entries(group).filter(([key]) => includeTotal || key !== 'total');

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();

    const [dashboardData, setDashboardData] = useState<AdminCountersData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusModal, setStatusModal] = useState<StatusModalState | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await authService.adminCounters();
            setDashboardData(response.data);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            setError(typeof msg === 'object' ? (msg?.user || 'Failed to load dashboard counters') : (msg || 'Failed to load dashboard counters'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== 0) {
            setLoading(false);
            return;
        }

        fetchDashboardData();
    }, [authLoading, user, fetchDashboardData]);

    const summaryCards = useMemo<CounterCard[]>(() => {
        if (!dashboardData) return [];

        const cards: CounterCard[] = [];

        if (dashboardData.users && typeof dashboardData.users.total === 'number') {
            cards.push({
                key: 'users',
                label: 'users',
                value: dashboardData.users.total,
                icon: <UserRound size={17} className="text-blue-600" />,
                iconBg: 'bg-blue-50',
            });
        }

        if (dashboardData.tickets && typeof dashboardData.tickets.total === 'number') {
            cards.push({
                key: 'tickets',
                label: 'tickets',
                value: dashboardData.tickets.total,
                icon: <Ticket size={17} className="text-indigo-600" />,
                iconBg: 'bg-indigo-50',
                statusGroup: dashboardData.tickets,
            });
        }

        if (dashboardData.orders && typeof dashboardData.orders.total === 'number') {
            cards.push({
                key: 'orders',
                label: 'orders',
                value: dashboardData.orders.total,
                icon: <ReceiptText size={17} className="text-amber-600" />,
                iconBg: 'bg-amber-50',
                statusGroup: dashboardData.orders,
            });
        }

        if (dashboardData.bets && typeof dashboardData.bets.total === 'number') {
            cards.push({
                key: 'bets',
                label: 'bets',
                value: dashboardData.bets.total,
                icon: <CircleDollarSign size={17} className="text-emerald-600" />,
                iconBg: 'bg-emerald-50',
                statusGroup: dashboardData.bets,
            });
        }

        if (dashboardData.payouts && typeof dashboardData.payouts.total === 'number') {
            cards.push({
                key: 'payouts',
                label: 'payouts',
                value: dashboardData.payouts.total,
                icon: <Wallet size={17} className="text-violet-600" />,
                iconBg: 'bg-violet-50',
                statusGroup: dashboardData.payouts,
            });
        }

        return cards;
    }, [dashboardData]);

    const financeRows = useMemo(() => {
        if (!dashboardData?.finance) return [];

        return Object.entries(dashboardData.finance).filter(
            (entry): entry is [string, number] => typeof entry[1] === 'number'
        );
    }, [dashboardData]);

    const financeIcon = (key: string, value: number) => {
        if (key === 'totalDeposit') return <Wallet size={14} className="text-emerald-600" />;
        if (key === 'totalBetAmount') return <CircleDollarSign size={14} className="text-blue-600" />;
        if (key === 'totalPnl') return <TrendingUp size={14} className="text-indigo-600" />;
        if (key === 'companyProfit') {
            return value >= 0
                ? <TrendingUp size={14} className="text-emerald-600" />
                : <TrendingDown size={14} className="text-red-600" />;
        }
        return <ReceiptText size={14} className="text-slate-500" />;
    };

    const financeRowStyle = (key: string, value: number) => {
        if (key !== 'companyProfit') return 'border-dash-border bg-white text-dash-text-primary';
        return value >= 0
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-red-200 bg-red-50 text-red-600';
    };

    if (authLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center min-h-105">
                <div className="flex items-center gap-2 text-dash-text-secondary">
                    <Loader2 size={16} className="animate-spin" />
                    Preparing dashboard...
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="w-full h-full flex items-center justify-center min-h-105">
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                        <LockKeyhole size={24} className="text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-dash-text-primary">Login Required</h3>
                    <p className="text-sm text-dash-text-secondary max-w-sm">
                        You need to be logged in to view dashboard analytics.
                    </p>
                </div>
            </div>
        );
    }

    if (user.role !== 0) {
        return (
            <div className="w-full h-full flex items-center justify-center min-h-105">
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                        <ShieldAlert size={24} className="text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-dash-text-primary">Admin Access Only</h3>
                    <p className="text-sm text-dash-text-secondary max-w-sm">
                        This overview is only available to administrator accounts.
                    </p>
                </div>
            </div>
        );
    }

    if (loading && !dashboardData) {
        return (
            <div className="w-full h-full flex flex-col">
                <h2 className="text-2xl font-bold text-dash-text-primary mb-6">Overview</h2>
                <div className="bg-white rounded-xl border border-dash-border p-10 flex items-center justify-center min-h-105">
                    <div className="flex items-center gap-2 text-dash-text-secondary">
                        <Loader2 size={16} className="animate-spin" />
                        Loading dashboard counters...
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="w-full h-full flex flex-col">
                <h2 className="text-2xl font-bold text-dash-text-primary mb-6">Overview</h2>
                <div className="bg-white rounded-xl border border-red-200 p-8 flex flex-col items-center justify-center min-h-80 gap-3 text-center">
                    <AlertCircle size={20} className="text-red-500" />
                    <p className="text-sm text-red-600">{error || 'Unable to load dashboard counters.'}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-3 py-2 text-xs font-semibold rounded-md border border-dash-border text-dash-text-primary hover:bg-slate-50"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-dash-text-primary">Overview</h2>
                    <p className="text-sm text-dash-text-secondary mt-0.5">
                        Admin counters are rendered directly from backend response keys and values.
                    </p>
                </div>

                <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md border border-dash-border bg-white text-dash-text-primary hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                {summaryCards.map((card) => (
                    <div key={card.key} className="bg-white border border-dash-border rounded-md p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                                {card.icon}
                            </div>
                            {card.statusGroup && (
                                <button
                                    onClick={() => setStatusModal({ title: card.label, group: card.statusGroup as Record<string, number> })}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-dash-border text-dash-text-secondary hover:bg-slate-50 hover:text-dash-text-primary"
                                    title={`View ${card.label} statuses`}
                                >
                                    <Eye size={14} />
                                </button>
                            )}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-dash-text-primary">{card.value}</p>
                            <p className="text-xs text-dash-text-secondary">{card.label}</p>
                        </div>

                        {card.statusGroup && (
                            <div className="flex flex-wrap gap-1.5">
                                {getStatusRows(card.statusGroup)
                                    .slice(0, 2)
                                    .map(([status, count]) => (
                                        <span
                                            key={status}
                                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-dash-text-secondary text-[10px] font-semibold"
                                        >
                                            {status}: {count}
                                        </span>
                                    ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-md border border-dash-border p-4">
                <h3 className="text-base font-semibold text-dash-text-primary mb-4">Finance Snapshot</h3>

                {financeRows.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                        {financeRows.map(([key, value]) => (
                            <div key={key} className={`rounded-md border p-3 ${financeRowStyle(key, value)}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {financeIcon(key, value)}
                                    <p className="text-xs">{key}</p>
                                </div>
                                <p className="text-lg font-semibold">{formatMoney(value)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-md border border-dash-border p-3 text-sm text-dash-text-secondary">
                        No finance keys returned by API.
                    </div>
                )}
            </div>

            {statusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setStatusModal(null)} />
                    <div className="relative w-full max-w-xl bg-white rounded-xl border border-dash-border shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-dash-border flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-semibold text-dash-text-primary">{statusModal.title} details</h4>
                                <p className="text-xs text-dash-text-secondary">Backend status rows shown as-is.</p>
                            </div>
                            <button
                                onClick={() => setStatusModal(null)}
                                className="w-8 h-8 rounded-md border border-dash-border flex items-center justify-center text-dash-text-secondary hover:bg-slate-50"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="p-4 max-h-[60vh] overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border border-dash-border">
                                        <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-3 py-2">Status</th>
                                        <th className="text-right text-[11px] uppercase tracking-wider text-dash-text-secondary px-3 py-2">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getStatusRows(statusModal.group, true).map(([status, count]) => (
                                        <tr key={status} className="border-b border-dash-border last:border-b-0">
                                            <td className="px-3 py-2 text-dash-text-primary">{status}</td>
                                            <td className="px-3 py-2 text-right font-semibold text-dash-text-primary">{count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
