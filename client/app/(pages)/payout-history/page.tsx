'use client';
import React, { useEffect, useState } from 'react';
import { PublicLayout } from '@/app/components/layout';
import { ArrowUpRight, Clock, CheckCircle2, XCircle, Search, Filter, Download, ChevronDown, Loader2, Ban, Plus, X, CreditCard, DollarSign, Bitcoin, Building2, AlertCircle } from 'lucide-react';
import { authService, payoutService, PayoutItem, CreatePayoutRequest } from '@/app/services';
import { useAuth } from '@/app/context/AuthContext';

interface UiPayout {
    rawId: string;
    id: string;
    date: string;
    amount: number;
    accountType: string;
    type: string;
    status: string;
}

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

const toUiPayout = (payout: PayoutItem): UiPayout => {
    return {
        rawId: payout._id,
        id: payout._id,
        date: formatDate(payout.createdAt),
        amount: Number(payout.amount) || 0,
        accountType: payout.accountType || '-',
        type: payout.type || '-',
        status: (payout.status || 'placed').toLowerCase(),
    };
};

export default function PayoutHistoryPage() {
    const { updateUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [payouts, setPayouts] = useState<UiPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create payout modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        accountType: 'standard' as 'standard' | 'professional',
        type: 'crypto' as 'crypto' | 'bank',
        amount: '',
    });
    const [isCreating, setIsCreating] = useState(false);
    const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchPayouts = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setPayouts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await payoutService.getAll(1, 100);
            const data = response?.data?.data || [];
            setPayouts(data.map(toUiPayout));
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string | { user?: string } } } };
            const message = apiError?.response?.data?.message;
            setError(typeof message === 'object' ? (message.user || 'Failed to load payouts') : (message || 'Failed to load payouts'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const filteredPayouts = payouts.filter((p) => {
        const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || p.status === filterStatus.toLowerCase();
        const matchesType = filterType === 'All' || p.type === filterType.toLowerCase();
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'complete':
                return {
                    bg: 'bg-[var(--bg-green-primary)]/10',
                    text: 'text-[var(--bg-green-primary)]',
                    icon: <CheckCircle2 size={14} />,
                };
            case 'pending':
            case 'placed':
                return {
                    bg: 'bg-[var(--bg-yellow-primary)]/10',
                    text: 'text-[var(--bg-yellow-primary)]',
                    icon: <Clock size={14} />,
                };
            case 'rejected':
                return {
                    bg: 'bg-red-500/10',
                    text: 'text-red-500',
                    icon: <XCircle size={14} />,
                };
            default:
                return {
                    bg: 'bg-gray-500/10',
                    text: 'text-gray-400',
                    icon: <Clock size={14} />,
                };
        }
    };

    const handleCreatePayout = async () => {
        const amount = Number(createForm.amount);
        if (!amount || amount <= 0) {
            setCreateMessage({ type: 'error', text: 'Please enter a valid amount.' });
            return;
        }

        setIsCreating(true);
        setCreateMessage(null);

        try {
            const payload: CreatePayoutRequest = {
                amount,
                accountType: createForm.accountType,
                type: createForm.type,
            };
            const response = await payoutService.create(payload);
            if (response?.status === 200 || response?.status === 201) {
                setCreateMessage({ type: 'success', text: response?.message || 'Payout request created successfully!' });
                setCreateForm({ accountType: 'standard', type: 'crypto', amount: '' });
                // Refresh list
                fetchPayouts();

                // Update user balance
                try {
                    const meRes = await authService.me();
                    const apiUser = meRes?.data?.user;
                    if (apiUser) {
                        const walletS = Number(apiUser.walletS) || 0;
                        const walletPVal = Number(apiUser.walletP) || 0;
                        const acctType = apiUser.accountType || 'standard';
                        updateUser({
                            walletS,
                            walletP: walletPVal,
                            balance: acctType === 'professional' ? walletPVal : walletS,
                        });
                    }
                } catch (meErr) {
                    console.error("Failed to refresh user balance:", meErr);
                }

                setTimeout(() => {
                    setShowCreateModal(false);
                    setCreateMessage(null);
                }, 1500);
            } else {
                const msg = response?.message;
                const errorText = typeof msg === 'object' ? ((msg as { user?: string }).user || 'Failed to create payout') : (msg || 'Failed to create payout');
                setCreateMessage({ type: 'error', text: errorText });
            }
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            const errorText = typeof msg === 'object' ? (msg.user || 'Failed to create payout') : (msg || 'Failed to create payout');
            setCreateMessage({ type: 'error', text: errorText });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <PublicLayout isSubPage={true}>
            <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">
                <div className="p-4 md:p-6 pb-0 flex-shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold text-white uppercase tracking-wider mb-1">
                                Payout <span className="text-[var(--bg-yellow-primary)]">History</span>
                            </h1>
                            <p className="text-[var(--text-muted)] font-inter text-[12px]">
                                Track all your withdrawal requests and their statuses.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setShowCreateModal(true); setCreateMessage(null); }}
                                className="flex items-center gap-2 bg-[var(--bg-green-primary)] hover:bg-[var(--bg-green-primary)]/90 text-[var(--bg-navy-secondary)] px-4 py-2 rounded-sm border border-[var(--bg-green-primary)] transition-all text-xs font-bold"
                            >
                                <Plus size={14} />
                                <span>Create Payout</span>
                            </button>
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
                                placeholder="Search payouts..."
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-4 text-white font-inter text-xs focus:outline-none focus:border-[var(--bg-yellow-primary)] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <select
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-4 text-white font-inter text-xs appearance-none focus:outline-none focus:border-[var(--bg-yellow-primary)] transition-all cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="placed">Placed</option>
                                <option value="pending">Pending</option>
                                <option value="complete">Complete</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <select
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-4 text-white font-inter text-xs appearance-none focus:outline-none focus:border-[var(--bg-yellow-primary)] transition-all cursor-pointer"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="All">All Methods</option>
                                <option value="crypto">Crypto</option>
                                <option value="bank">Bank Transfer</option>
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
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Method</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Account</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Amount</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-primary)]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] font-inter text-sm">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Loading payouts...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <p className="text-red-400 font-inter text-sm">{error}</p>
                                            </td>
                                        </tr>
                                    ) : filteredPayouts.length > 0 ? (
                                        filteredPayouts.map((payout) => {
                                            const statusStyle = getStatusStyles(payout.status);
                                            return (
                                                <tr key={payout.rawId} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="text-white font-inter text-[12px] font-medium">{payout.date.split(' ')[0]}</div>
                                                        <div className="text-[var(--text-muted)] font-inter text-[10px]">{payout.date.split(' ')[1]}</div>
                                                    </td>
                                                    <td className="py-4 px-4 font-inter text-[12px] text-white font-semibold">
                                                        <span className="font-mono text-[11px]">{payout.id.slice(0, 8)}...{payout.id.slice(-4)}</span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center">
                                                                <ArrowUpRight className="text-[var(--bg-yellow-primary)]" size={14} />
                                                            </div>
                                                            <span className="text-white font-inter text-[12px] font-medium capitalize">{payout.type === 'crypto' ? 'Crypto' : 'Bank Transfer'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-[var(--text-muted)] font-inter text-[12px] capitalize">{payout.accountType}</span>
                                                    </td>
                                                    <td className="py-4 px-4 font-orbitron text-[12px] font-bold">
                                                        <span className="text-red-400">-${Math.abs(payout.amount).toFixed(2)}</span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-black/5 ${statusStyle.bg} ${statusStyle.text} font-inter text-[10px] font-bold uppercase tracking-wider`}>
                                                            {statusStyle.icon}
                                                            {payout.status}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Ban size={24} className="text-[var(--text-muted)] opacity-30" />
                                                    <p className="text-[var(--text-muted)] font-inter text-sm opacity-50 uppercase tracking-widest font-bold">No Records Found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="py-3 px-4 border-t border-[var(--border-primary)] flex items-center justify-between text-[11px] bg-[var(--bg-secondary)] flex-shrink-0">
                            <span className="text-[var(--text-muted)] font-inter uppercase tracking-tighter">Total Results: {filteredPayouts.length}</span>
                            <div className="flex items-center gap-1">
                                <button className="px-2 py-1 rounded-sm border border-[var(--border-primary)] text-white hover:bg-white/5 disabled:opacity-30">Prev</button>
                                <button className="px-2.5 py-1 rounded-sm bg-[var(--bg-yellow-primary)] text-[var(--bg-navy-secondary)] font-bold">1</button>
                                <button className="px-2 py-1 rounded-sm border border-[var(--border-primary)] text-white hover:bg-white/5">Next</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Payout Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); setCreateMessage(null); }} />
                        <div className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-sm border border-[var(--border-primary)] shadow-xl overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-[var(--border-primary)] flex items-center justify-between">
                                <div>
                                    <h3 className="text-md font-orbitron font-bold text-white uppercase tracking-wider">Create Payout</h3>
                                    <p className="text-[var(--text-muted)] font-inter text-[11px] mt-0.5">Request a new withdrawal</p>
                                </div>
                                <button
                                    onClick={() => { setShowCreateModal(false); setCreateMessage(null); }}
                                    className="w-8 h-8 rounded-sm border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:bg-white/5 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-6 flex flex-col gap-5">
                                {/* Account Type */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Account Type</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                        <select
                                            value={createForm.accountType}
                                            onChange={(e) => setCreateForm({ ...createForm, accountType: e.target.value as 'standard' | 'professional' })}
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-10 text-white font-inter text-sm appearance-none focus:outline-none focus:border-[var(--bg-green-primary)] transition-all cursor-pointer"
                                        >
                                            <option value="standard">Standard</option>
                                            <option value="professional">Professional</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Payout Method */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Payout Method</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCreateForm({ ...createForm, type: 'crypto' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm border text-xs font-bold transition-all ${createForm.type === 'crypto'
                                                    ? 'bg-[var(--bg-green-primary)]/10 border-[var(--bg-green-primary)] text-[var(--bg-green-primary)]'
                                                    : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-muted)] hover:bg-white/5'
                                                }`}
                                        >
                                            <Bitcoin size={14} />
                                            Crypto
                                        </button>
                                        <button
                                            onClick={() => setCreateForm({ ...createForm, type: 'bank' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm border text-xs font-bold transition-all ${createForm.type === 'bank'
                                                    ? 'bg-[var(--bg-yellow-primary)]/10 border-[var(--bg-yellow-primary)] text-[var(--bg-yellow-primary)]'
                                                    : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-muted)] hover:bg-white/5'
                                                }`}
                                        >
                                            <Building2 size={14} />
                                            Bank
                                        </button>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Amount (USD)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bg-green-primary)]" size={16} />
                                        <input
                                            type="number"
                                            placeholder="Enter amount"
                                            min="1"
                                            value={createForm.amount}
                                            onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                {createMessage && (
                                    <div className={`flex items-center gap-2 text-[12px] font-inter font-medium ${createMessage.type === 'success' ? 'text-[var(--bg-green-primary)]' : 'text-red-400'}`}>
                                        {createMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                        {createMessage.text}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    onClick={handleCreatePayout}
                                    disabled={isCreating}
                                    className="w-full flex items-center justify-center gap-2 bg-[var(--bg-green-primary)] hover:bg-[var(--bg-green-primary)]/90 text-[var(--bg-navy-secondary)] py-3 rounded-sm font-bold transition-all text-sm cursor-pointer disabled:opacity-60"
                                >
                                    {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    <span>{isCreating ? 'Creating...' : 'Create Payout Request'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
