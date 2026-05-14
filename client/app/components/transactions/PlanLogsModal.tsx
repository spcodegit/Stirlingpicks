'use client';
import React, { useEffect, useState } from 'react';
import { X, ScrollText, Loader2, ChevronRight, Trophy, AlertTriangle, BarChart3, ShieldCheck, CreditCard } from 'lucide-react';
import { planLogsService, PlanLogItem } from '@/app/services';

interface PlanLogsModalProps {
    open: boolean;
    userId: string;
    orderId: string;
    onClose: () => void;
    variant?: 'public' | 'dashboard';
}

const LOG_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    plan_purchased: {
        label: 'Plan Purchased',
        icon: <CreditCard size={14} />,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/15',
    },
    plan_expired: {
        label: 'Plan Expired',
        icon: <AlertTriangle size={14} />,
        color: 'text-red-400',
        bgColor: 'bg-red-500/15',
    },
    bet_placed: {
        label: 'Bet Placed',
        icon: <Trophy size={14} />,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/15',
    },
    bet_finalized: {
        label: 'Bet Finalized',
        icon: <BarChart3 size={14} />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/15',
    },
    eligibility_updated: {
        label: 'Eligibility Updated',
        icon: <ShieldCheck size={14} />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/15',
    },
};

const formatLogDate = (date: string) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return { date: '-', time: '' };
    return {
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`,
    };
};

export default function PlanLogsModal({ open, userId, orderId, onClose, variant = 'public' }: PlanLogsModalProps) {
    const [logs, setLogs] = useState<PlanLogItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open || !userId || !orderId) return;
        const fetchLogs = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await planLogsService.getByUserAndOrder(userId, orderId);
                setLogs(response?.data || []);
            } catch {
                setError('Failed to load plan logs.');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [open, userId, orderId]);

    if (!open) return null;

    const isDashboard = variant === 'dashboard';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className={`relative w-full max-w-[640px] shadow-2xl rounded-sm overflow-hidden border animate-in fade-in zoom-in duration-300 ${isDashboard ? 'bg-white border-gray-200' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'}`}>
                {/* Header */}
                <div className={`relative h-[56px] flex items-center px-4 ${isDashboard ? 'bg-gray-50 border-b border-gray-200' : 'bg-[var(--bg-green-primary)]'}`}>
                    <div className="relative flex items-center gap-2.5 z-10">
                        <ScrollText size={18} className={isDashboard ? 'text-gray-700' : 'text-[var(--bg-navy-secondary)]'} />
                        <span className={`font-bold text-[15px] tracking-wide uppercase ${isDashboard ? 'text-gray-800' : 'text-[var(--bg-navy-secondary)]'}`}>
                            Professional Plan Logs
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className={`relative ml-auto p-1 transition-all z-20 cursor-pointer ${isDashboard ? 'text-gray-400 hover:text-gray-700' : 'text-[var(--bg-navy-secondary)]/70 hover:text-[var(--bg-navy-secondary)]'}`}
                        type="button"
                    >
                        <X size={22} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className={`max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar ${isDashboard ? 'bg-white' : ''}`}>
                    {loading ? (
                        <div className={`flex items-center justify-center gap-2 py-16 ${isDashboard ? 'text-gray-500' : 'text-[var(--text-muted)]'}`}>
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm">Loading plan logs...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-16">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className={`flex items-center justify-center py-16 ${isDashboard ? 'text-gray-400' : 'text-[var(--text-muted)]'}`}>
                            <p className="text-sm font-medium uppercase tracking-widest opacity-60">No logs found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {logs.map((log, index) => {
                                const config = LOG_TYPE_CONFIG[log.type] || LOG_TYPE_CONFIG.eligibility_updated;
                                const { date, time } = formatLogDate(log.createdAt);

                                return (
                                    <div
                                        key={log._id}
                                        className={`px-4 py-3.5 flex items-start gap-3 transition-colors ${isDashboard ? 'hover:bg-gray-50/80 border-b border-gray-100' : 'hover:bg-white/[0.02]'}`}
                                    >
                                        {/* Sequence number */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${isDashboard ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-white/60'}`}>
                                            {index + 1}
                                        </div>

                                        {/* Type badge */}
                                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${config.bgColor} ${config.color}`}>
                                            {config.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${config.color}`}>
                                                    {config.label}
                                                </span>
                                                <ChevronRight size={10} className={isDashboard ? 'text-gray-300' : 'text-white/20'} />
                                                <span className={`text-[10px] font-medium ${isDashboard ? 'text-gray-400' : 'text-white/40'}`}>
                                                    {date} {time}
                                                </span>
                                            </div>
                                            <p className={`text-[12px] leading-relaxed ${isDashboard ? 'text-gray-600' : 'text-white/70'}`}>
                                                {log.message}
                                            </p>

                                            {/* Meta info */}
                                            {log.meta && Object.keys(log.meta).length > 0 && (
                                                <div className={`mt-2 p-2 rounded text-[10px] font-mono space-y-0.5 ${isDashboard ? 'bg-gray-50 border border-gray-100 text-gray-500' : 'bg-white/5 border border-white/5 text-white/40'}`}>
                                                    {Object.entries(log.meta).map(([key, value]) => {
                                                        if (typeof value === 'object' && value !== null) return null;

                                                        let displayValue = String(value);
                                                        const isDateKey = ['createdAt', 'startsAt', 'expiresAt', 'matchDate'].includes(key);
                                                        const isCurrencyKey = ['price', 'creditedAmount', 'paidAmount', 'amount', 'netProfit', 'pnl'].includes(key);

                                                        if (isDateKey) {
                                                            const { date, time } = formatLogDate(displayValue);
                                                            displayValue = `${date} ${time}`;
                                                        } else if (isCurrencyKey) {
                                                            displayValue = `$${Number(value).toFixed(2)}`;
                                                        }

                                                        return (
                                                            <div key={key} className="flex gap-2">
                                                                <span className={isDashboard ? 'text-gray-400' : 'text-white/30'}>{key}:</span>
                                                                <span className={isDashboard ? 'text-gray-600' : 'text-white/60'}>{displayValue}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`px-4 py-3 flex items-center justify-between text-[11px] ${isDashboard ? 'bg-gray-50 border-t border-gray-200 text-gray-500' : 'bg-[var(--bg-tertiary)] border-t border-[var(--border-primary)] text-[var(--text-muted)]'}`}>
                    <span className="uppercase tracking-wider font-medium">
                        Total Logs: {logs.length}
                    </span>
                    <span className="uppercase tracking-wider opacity-60">
                        Sorted by date (oldest first)
                    </span>
                </div>
            </div>
        </div>
    );
}
