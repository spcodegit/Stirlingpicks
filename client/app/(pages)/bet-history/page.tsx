'use client';
import React, { useEffect, useState } from 'react';
import { PublicLayout } from '@/app/components/layout';
import { ArrowRightLeft, CheckCircle2, Clock, XCircle, Search, Filter, Download, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { betService, BetItem } from '@/app/services';
import RowActionMenu from '@/app/components/transactions/RowActionMenu';
import TransactionDetailsModal from '@/app/components/transactions/TransactionDetailsModal';

interface UiBet {
    rawId: string;
    id: string;
    date: string;
    type: string;
    amount: number;
    pnl: number | null;
    method: string;
    status: string;
    details: string;
    accountType: string;
}

const normalizeStatus = (status: string) => {
    const value = (status || '').toLowerCase();
    if (value === 'win' || value === 'completed') return 'win';
    if (value === 'lose' || value === 'loss' || value === 'lost' || value === 'failed') return 'lose';
    if (value === 'placed' || value === 'finalizing' || value === 'pending') return 'pending';
    if (value === 'plan expire') return 'plan expire';
    return 'pending';
};

const formatDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '-';
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const hh = String(parsed.getHours()).padStart(2, '0');
    const min = String(parsed.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const toUiBet = (bet: BetItem): UiBet => {
    const selection = bet?.placedBet?.name ? bet.placedBet.name.toUpperCase() : 'N/A';
    const league = bet?.sport?.league || 'General';
    const sport = bet?.sport?.name || 'Sport';
    const status = normalizeStatus(bet.status);
    const stake = Number(bet.price) || 0;
    const resolvedPnl =
        typeof bet.pnl === 'number'
            ? bet.pnl
            : status === 'lose'
                ? -stake
                : status === 'win'
                    ? stake
                    : null;

    return {
        rawId: bet._id,
        id: bet._id,
        date: formatDate(bet.createdAt),
        type: 'Bet Placement',
        amount: stake,
        pnl: resolvedPnl,
        method: `${sport} / ${league}`,
        status,
        details: `${selection} @ ${bet?.placedBet?.value ?? 'N/A'} | ${bet?.bet?.homeTeam || 'Home'} vs ${bet?.bet?.awayTeam || 'Away'}`,
        accountType: bet.accountType,
    };
};

export default function BetHistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [bets, setBets] = useState<UiBet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBet, setSelectedBet] = useState<UiBet | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        const fetchBets = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setBets([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await betService.getAllBets(1, 100);
                const data = response?.data?.data || [];
                setBets(data.map(toUiBet));
            } catch (err: unknown) {
                const apiError = err as { response?: { data?: { message?: string | { user?: string } } } };
                const message = apiError?.response?.data?.message;
                setError(typeof message === 'object' ? (message.user || 'Failed to load bets') : (message || 'Failed to load bets'));
            } finally {
                setLoading(false);
            }
        };

        fetchBets();
    }, []);

    const handleViewBetById = async (id: string) => {
        try {
            setDetailsLoading(true);
            const response = await betService.getBetById(id);
            const bet = response?.data;
            if (!bet) return;
            setSelectedBet(toUiBet(bet));
            setIsDetailsModalOpen(true);
        } catch {
            // Keep list visible if details fetch fails.
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredBets = bets.filter((bet) => {
        const matchesSearch = bet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bet.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' ||
            bet.type.toLowerCase().includes(filterType.toLowerCase());
        return matchesSearch && matchesType;
    });

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'win':
                return {
                    bg: 'bg-[var(--bg-green-primary)]/10',
                    text: 'text-[var(--bg-green-primary)]',
                    icon: <CheckCircle2 size={14} />
                };
            case 'pending':
                return {
                    bg: 'bg-[var(--bg-yellow-primary)]/10',
                    text: 'text-[var(--bg-yellow-primary)]',
                    icon: <Clock size={14} />
                };
            case 'lose':
                return {
                    bg: 'bg-red-500/10',
                    text: 'text-red-500',
                    icon: <XCircle size={14} />
                };
            case 'plan expire':
                return {
                    bg: 'bg-red-500/10',
                    text: 'text-red-500',
                    icon: <XCircle size={14} />
                };
            default:
                return {
                    bg: 'bg-gray-500/10',
                    text: 'text-gray-400',
                    icon: <Clock size={14} />
                };
        }
    };

    return (
        <PublicLayout isSubPage={true}>
            <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">
                <div className="p-4 md:p-6 pb-0 flex-shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold text-white uppercase tracking-wider mb-1">
                                Bet <span className="text-[var(--bg-yellow-primary)]">History</span>
                            </h1>
                            <p className="text-[var(--text-muted)] font-inter text-[12px]">
                                Keep track of all bets placed from your account.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-white px-3 py-2 rounded-sm border border-[var(--border-primary)] transition-all text-xs font-medium">
                                <Download size={14} />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <input
                                type="text"
                                placeholder="Search bets..."
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-4 text-white font-inter text-xs focus:outline-none focus:border-[var(--bg-yellow-primary)] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <select
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-4 text-white font-inter text-xs appearance-none focus:outline-none focus:border-[var(--bg-yellow-primary)] transition-all cursor-pointer"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="All">All Bets</option>
                                <option value="Bet">Bet Placements</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <select
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-4 text-white font-inter text-xs appearance-none focus:outline-none focus:border-[var(--bg-yellow-primary)] transition-all cursor-pointer"
                            >
                                <option>Last 30 Days</option>
                                <option>Last 7 Days</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                        </div>
                    </div>

                </div>
                <div className="flex-1 overflow-hidden px-4 md:px-6 pb-6">
                    <div className="h-full flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm overflow-hidden">
                        <div className="flex-1 overflow-auto no-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Date</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">ID</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Type</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Sport / League</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Amount</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Account</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">PnL</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Status</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-primary)]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="py-20 text-center">
                                                <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] font-inter text-sm">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Loading bets...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={9} className="py-20 text-center">
                                                <p className="text-red-400 font-inter text-sm">{error}</p>
                                            </td>
                                        </tr>
                                    ) : filteredBets.length > 0 ? (
                                        filteredBets.map((bet) => {
                                            const statusStyle = getStatusStyles(bet.status);
                                            return (
                                                <tr key={bet.rawId} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="text-white font-inter text-[12px] font-medium">{bet.date.split(' ')[0]}</div>
                                                        <div className="text-[var(--text-muted)] font-inter text-[10px]">{bet.date.split(' ')[1]}</div>
                                                    </td>
                                                    <td className="py-4 px-4 font-inter text-[12px] text-white font-semibold">
                                                        {bet.id}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center">
                                                                <ArrowRightLeft className="text-[var(--bg-yellow-primary)]" size={18} />
                                                            </div>
                                                            <span className="text-white font-inter text-[12px] font-medium">{bet.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-[var(--text-muted)] font-inter text-[12px]">{bet.method}</span>
                                                    </td>
                                                    <td className="py-4 px-4 font-orbitron text-[12px] font-bold">
                                                        <span className="text-white">
                                                            ${Math.abs(bet.amount).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 font-orbitron text-[12px] font-bold">
                                                        <span className="text-white">
                                                            {bet.accountType}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 font-orbitron text-[12px] font-bold">
                                                        {bet.pnl === null ? (
                                                            <span className="text-[var(--text-muted)]">-</span>
                                                        ) : (
                                                            <span className={bet.status === 'win' ? 'text-[var(--bg-green-primary)]' : (bet.status === 'lose' || bet.status === 'plan expire') ? 'text-red-500' : 'text-[var(--text-muted)]'}>
                                                                ${Math.abs(bet.pnl).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-black/5 ${statusStyle.bg} ${statusStyle.text} font-inter text-[10px] font-bold uppercase tracking-wider`}>
                                                            {statusStyle.icon}
                                                            {bet.status}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <RowActionMenu onDetails={() => handleViewBetById(bet.rawId)} />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="py-20 text-center">
                                                <p className="text-[var(--text-muted)] font-inter text-sm opacity-50 uppercase tracking-widest font-bold">No Records Found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="py-3 px-4 border-t border-[var(--border-primary)] flex items-center justify-between text-[11px] bg-[var(--bg-secondary)] flex-shrink-0">
                            <span className="text-[var(--text-muted)] font-inter uppercase tracking-tighter">Total Results: {filteredBets.length}</span>
                            <div className="flex items-center gap-1">
                                <button className="px-2 py-1 rounded-sm border border-[var(--border-primary)] text-white hover:bg-white/5 disabled:opacity-30">Prev</button>
                                <button className="px-2.5 py-1 rounded-sm bg-[var(--bg-yellow-primary)] text-[var(--bg-navy-secondary)] font-bold">1</button>
                                <button className="px-2 py-1 rounded-sm border border-[var(--border-primary)] text-white hover:bg-white/5">Next</button>
                            </div>
                        </div>
                    </div>
                </div>

                <TransactionDetailsModal
                    open={isDetailsModalOpen}
                    loading={detailsLoading}
                    transaction={selectedBet}
                    onClose={() => setIsDetailsModalOpen(false)}
                />
            </div>
        </PublicLayout>
    );
}
