'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {Search, Filter, ChevronDown, Loader2,CheckCircle2, Clock, XCircle, Trophy, LockKeyhole
} from 'lucide-react';
import { betService, BetItem, PopulatedUser } from '@/app/services';
import { useAuth } from '@/app/context/AuthContext';

const STATUS_OPTIONS = ['placed', 'win', 'loss', 'plan expire'] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    win: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 size={13} /> },
    placed: { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Clock size={13} /> },
    finalizing: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: <Clock size={13} /> },
    loss: { bg: 'bg-red-50', text: 'text-red-600', icon: <XCircle size={13} /> },
    'plan expire': { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle size={13} /> },
};

const formatDateTime = (date: string): { date: string; time: string } => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return { date: '-', time: '' };
    return {
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    };
};

const getUserInfo = (userId: BetItem['userId']): { name: string; email: string } => {
    if (typeof userId === 'object' && userId !== null) {
        return { name: (userId as PopulatedUser).name || '-', email: (userId as PopulatedUser).email || '-' };
    }
    return { name: '-', email: '-' };
};

export default function DashboardBetsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 0;

    const [bets, setBets] = useState<BetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 20;

    const fetchBets = useCallback(async (currentPage: number, status: string) => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const filters = status !== 'All' ? { status } : undefined;
            const response = await betService.getAllBets(currentPage, LIMIT, filters);
            const result = response?.data;
            setBets(result?.data || []);
            setTotal(result?.pagination?.total || 0);
            setTotalPages(result?.pagination?.totalPages || 1);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            setError(typeof msg === 'object' ? (msg.user || 'Failed to load bets') : (msg || 'Failed to load bets'));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBets(page, statusFilter);
    }, [fetchBets, page, statusFilter]);

    const handleStatusUpdate = async (betId: string, newStatus: string) => {
        setUpdatingId(betId);
        try {
            if (newStatus === 'win' || newStatus === 'loss') {
                await betService.finalizeBet(betId, newStatus as 'win' | 'loss');
            } else {
                await betService.updateBet(betId, { status: newStatus });
            }
            setBets(prev => prev.map(b => b._id === betId ? { ...b, status: newStatus as BetItem['status'] } : b));
        } catch {
            // silent — table stays intact
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = bets.filter(bet => {
        if (!searchTerm) return true;
        const home = bet.bet?.homeTeam || '';
        const away = bet.bet?.awayTeam || '';
        const sport = bet.sport?.name || '';
        const { name, email } = getUserInfo(bet.userId);
        return [home, away, sport, name, email, bet._id]
            .some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const colSpan = isAdmin ? 12 : 9;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <LockKeyhole size={28} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-dash-text-primary">Login Required</h3>
                <p className="text-sm text-dash-text-secondary max-w-xs">
                    You need to be logged in to view your bets.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-dash-text-primary tracking-tight">
                        {isAdmin ? 'All Bets' : 'My Bets'}
                    </h2>
                    <p className="text-sm text-dash-text-secondary mt-0.5">
                        {isAdmin ? 'Manage and review all user bets.' : 'Track all the bets placed from your account.'}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-dash-text-secondary bg-white border border-dash-border rounded-lg px-3 py-1.5">
                    <Trophy size={15} className="text-yellow-500" />
                    <span className="font-semibold">{total}</span> total bets
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by match, sport, user…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-dash-border rounded-lg text-sm text-dash-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="pl-9 pr-8 py-2.5 bg-white border border-dash-border rounded-lg text-sm text-dash-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-md border border-dash-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-dash-border">
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Date</th>
                                {isAdmin && (
                                    <>
                                        <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">User</th>
                                        <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Email</th>
                                    </>
                                )}
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Match</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Sport / League</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Selection</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Odds</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Stake</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">PnL</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Account</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                                {isAdmin && (
                                    <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap text-right">Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dash-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={colSpan} className="py-20 text-center">
                                        <div className="flex items-center justify-center gap-2 text-dash-text-secondary">
                                            <Loader2 size={16} className="animate-spin" />
                                            Loading bets…
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={colSpan} className="py-16 text-center text-red-500 text-sm">{error}</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={colSpan} className="py-16 text-center text-dash-text-secondary text-sm">No bets found.</td>
                                </tr>
                            ) : (
                                filtered.map(bet => {
                                    const style = STATUS_STYLES[bet.status] ?? STATUS_STYLES.placed;
                                    const { name, email } = getUserInfo(bet.userId);
                                    const isUpdating = updatingId === bet._id;
                                    return (
                                        <tr key={bet._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-4 py-3 text-xs">
                                                {(() => { const { date, time } = formatDateTime(bet.createdAt); return (<><div className="text-dash-text-primary font-medium whitespace-nowrap">{date}</div><div className="text-dash-text-primary mt-0.5">{time}</div></>); })()}
                                            </td>
                                            {isAdmin && (
                                                <>
                                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-dash-text-primary">{name}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-dash-text-secondary">{email}</td>
                                                </>
                                            )}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col items-center text-center gap-0.5">
                                                    <div className="font-medium text-dash-text-primary text-xs">{bet.bet?.homeTeam || 'N/A'}</div>
                                                    <div className="text-[10px] font-semibold text-dash-text-secondary uppercase tracking-widest">vs</div>
                                                    <div className="font-medium text-dash-text-primary text-xs">{bet.bet?.awayTeam || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <div className="text-dash-text-primary font-medium">{bet.sport?.name || '-'}</div>
                                                <div className="text-dash-text-primary mt-0.5">{bet.sport?.league || '-'}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-block bg-gray-100 text-dash-text-primary text-xs font-semibold px-2 py-0.5 rounded uppercase">
                                                    {bet.placedBet?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-dash-text-primary whitespace-nowrap">
                                                {bet.placedBet?.value ?? '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap font-semibold text-dash-text-primary">
                                                ${Number(bet.price || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap font-semibold">
                                                {bet.pnl === null || bet.pnl === undefined ? (
                                                    <span className="text-gray-400">-</span>
                                                ) : (
                                                    <span className={bet.status === 'win' ? 'text-green-600' : bet.status === 'lose' || bet.status === 'loss' ? 'text-red-600' : 'text-gray-600'}>
                                                        ${Math.abs(bet.pnl).toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs capitalize text-dash-text-secondary">{bet.accountType || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                                    {style.icon}
                                                    {bet.status}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    {isUpdating ? (
                                                        <Loader2 size={14} className="animate-spin inline text-gray-400" />
                                                    ) : (
                                                        <div className="relative inline-block">
                                                            <select
                                                                value={bet.status}
                                                                onChange={e => handleStatusUpdate(bet._id, e.target.value)}
                                                                disabled={bet.status === 'plan expire'}
                                                                className={`text-xs border border-dash-border rounded-md px-2 py-1 bg-white text-dash-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none pr-6 ${bet.status === 'plan expire' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                                            >
                                                                {STATUS_OPTIONS.map(s => (
                                                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown size={10} className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${bet.status === 'plan expire' ? 'text-gray-300' : 'text-gray-400'}`} />
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-dash-border flex items-center justify-between text-xs text-dash-text-secondary bg-gray-50/50">
                    <span>Showing {filtered.length} of {total} bets</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="px-3 py-1.5 border border-dash-border rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Prev
                        </button>
                        <span className="px-3 py-1.5 bg-[#50F090] text-black font-bold rounded-md border border-[#50F090]">
                            {page}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="px-3 py-1.5 border border-dash-border rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
