'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Filter, ChevronDown, Loader2,
    CheckCircle2, Clock, XCircle, AlertCircle, Trophy, LockKeyhole, Eye, X
} from 'lucide-react';
import { payoutService, PayoutItem } from '@/app/services';
import { PayoutUser } from '@/app/services/payoutService';
import { useAuth } from '@/app/context/AuthContext';
import { CURRENCIES } from '@/app/context/CurrencyContext';

const STATUS_OPTIONS = ['placed', 'pending', 'complete', 'rejected'] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    placed:   { bg: 'bg-gray-100',   text: 'text-gray-500',   icon: <Clock size={12} /> },
    pending:  { bg: 'bg-yellow-50',  text: 'text-yellow-600', icon: <Clock size={12} /> },
    complete: { bg: 'bg-green-100',  text: 'text-green-700',  icon: <CheckCircle2 size={12} /> },
    rejected: { bg: 'bg-red-50',     text: 'text-red-600',    icon: <XCircle size={12} /> },
};

const formatDateTime = (date: string) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return { date: '-', time: '' };
    return {
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    };
};

const getUserInfo = (userId: PayoutItem['userId']): { name: string; email: string } => {
    if (typeof userId === 'object' && userId !== null) {
        return { name: (userId as PayoutUser).name || '-', email: (userId as PayoutUser).email || '-' };
    }
    return { name: '-', email: '-' };
};

const getCurrencyMeta = (code?: string) =>
    CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];

export default function PayoutsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 0;

    const [payouts, setPayouts] = useState<PayoutItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [updatingId, setUpdatingId] = useState('');
    const [updateMsg, setUpdateMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);
    const [detailPayout, setDetailPayout] = useState<PayoutItem | null>(null);
    const LIMIT = 20;

    const fetchPayouts = useCallback(async (currentPage: number, status: string) => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const filters = status !== 'All' ? { status } : undefined;
            const response = await payoutService.getAll(currentPage, LIMIT, filters);
            const result = response?.data;
            setPayouts(result?.data || []);
            setTotal(result?.pagination?.total || 0);
            setTotalPages(result?.pagination?.totalPages || 1);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            setError(typeof msg === 'object' ? (msg.user || 'Failed to load payouts') : (msg || 'Failed to load payouts'));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPayouts(page, statusFilter);
    }, [fetchPayouts, page, statusFilter]);

    const handleStatusUpdate = async (payoutId: string, newStatus: string) => {
        setUpdatingId(payoutId);
        setUpdateMsg(null);
        try {
            const response = await payoutService.update(payoutId, { status: newStatus });
            if (response?.status === 200 || response?.status === 201) {
                setUpdateMsg({ id: payoutId, type: 'success', text: response?.message || 'Status updated' });
                // Refresh data
                fetchPayouts(page, statusFilter);
            } else {
                const msg = response?.message;
                const errorText = typeof msg === 'object' ? ((msg as { user?: string }).user || 'Failed to update') : (msg || 'Failed to update');
                setUpdateMsg({ id: payoutId, type: 'error', text: errorText });
            }
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            const errorText = typeof msg === 'object' ? (msg.user || 'Failed to update') : (msg || 'Failed to update');
            setUpdateMsg({ id: payoutId, type: 'error', text: errorText });
        } finally {
            setUpdatingId('');
            setTimeout(() => setUpdateMsg(null), 3000);
        }
    };

    const filtered = payouts.filter(p => {
        if (!searchTerm) return true;
        const { name, email } = getUserInfo(p.userId);
        return [p._id, p.type, p.accountType, name, email]
            .some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const colSpan = isAdmin ? 9 : 6;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <LockKeyhole size={28} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-dash-text-primary">Login Required</h3>
                <p className="text-sm text-dash-text-secondary max-w-xs">You need to be logged in to view payouts.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-dash-text-primary tracking-tight">
                        {isAdmin ? 'All Payout Requests' : 'Payout History'}
                    </h2>
                    <p className="text-sm text-dash-text-secondary mt-0.5">
                        {isAdmin ? 'Review and manage user payout/withdrawal requests.' : 'Track your payout requests.'}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-dash-text-secondary bg-white border border-dash-border rounded-lg px-3 py-1.5">
                    <Trophy size={15} className="text-yellow-500" />
                    <span className="font-semibold">{total}</span> total
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, user, method…"
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

            {/* Update Message Toast */}
            {updateMsg && (
                <div className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${updateMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {updateMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {updateMsg.text}
                </div>
            )}

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
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Payout ID</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Amount</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Method</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Account</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">{isAdmin ? 'Status / Action' : 'Status'}</th>
                                {isAdmin && (
                                    <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Details</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dash-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={colSpan} className="py-20 text-center">
                                        <div className="flex items-center justify-center gap-2 text-dash-text-secondary">
                                            <Loader2 size={16} className="animate-spin" />
                                            Loading payouts…
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={colSpan} className="py-16 text-center text-red-500 text-sm">{error}</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={colSpan} className="py-16 text-center text-dash-text-secondary text-sm">No payout requests found.</td>
                                </tr>
                            ) : (
                                filtered.map(payout => {
                                    const style = STATUS_STYLES[payout.status] ?? STATUS_STYLES.placed;
                                    const { name, email } = getUserInfo(payout.userId);
                                    const { date, time } = formatDateTime(payout.createdAt);
                                    return (
                                        <tr key={payout._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-4 py-3 text-xs">
                                                <div className="text-dash-text-primary font-medium whitespace-nowrap">{date}</div>
                                                <div className="text-dash-text-secondary mt-0.5">{time}</div>
                                            </td>
                                            {isAdmin && (
                                                <>
                                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-dash-text-primary">{name}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-dash-text-secondary">{email}</td>
                                                </>
                                            )}
                                            <td className="px-4 py-3">
                                                <div className="text-xs font-mono text-dash-text-primary">{payout._id.slice(0, 8)}…{payout._id.slice(-4)}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap font-semibold text-dash-text-primary">
                                                {getCurrencyMeta(payout.currency).symbol}{Number(payout.amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs capitalize text-dash-text-primary font-medium">{payout.type === 'crypto' ? 'Crypto' : 'Bank Transfer'}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs capitalize text-dash-text-secondary">{payout.accountType || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {isAdmin ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                                            {style.icon}
                                                            {payout.status}
                                                        </span>
                                                        <div className="relative">
                                                            <select
                                                                value=""
                                                                onChange={(e) => {
                                                                    if (e.target.value) handleStatusUpdate(payout._id, e.target.value);
                                                                }}
                                                                disabled={updatingId === payout._id}
                                                                className="text-xs bg-white border border-dash-border rounded-md px-2 py-1 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-wait"
                                                            >
                                                                <option value="">Update</option>
                                                                {STATUS_OPTIONS.filter(s => s !== payout.status).map(s => (
                                                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                        </div>
                                                        {updatingId === payout._id && <Loader2 size={14} className="animate-spin text-blue-500" />}
                                                    </div>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                                        {style.icon}
                                                        {payout.status}
                                                    </span>
                                                )}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <button
                                                        onClick={() => setDetailPayout(payout)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition cursor-pointer"
                                                    >
                                                        <Eye size={13} />
                                                        View
                                                    </button>
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
                    <span>Showing {filtered.length} of {total} payouts</span>
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

            {/* Detail Modal */}
            {detailPayout && (() => {
                const userObj = typeof detailPayout.userId === 'object' ? detailPayout.userId as PayoutUser : null;
                const { date, time } = formatDateTime(detailPayout.createdAt);
                const style = STATUS_STYLES[detailPayout.status] ?? STATUS_STYLES.placed;
                const crypto = userObj?.payOutCrypto;
                const bank = userObj?.payOutBank;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailPayout(null)} />
                        <div className="relative w-full max-w-lg bg-white rounded-lg border border-dash-border shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-dash-border flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h3 className="text-lg font-bold text-dash-text-primary">Payout Details</h3>
                                    <p className="text-xs text-dash-text-secondary mt-0.5 font-mono">{detailPayout._id}</p>
                                </div>
                                <button
                                    onClick={() => setDetailPayout(null)}
                                    className="w-8 h-8 rounded-md border border-dash-border flex items-center justify-center text-gray-400 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="overflow-y-auto p-6 flex flex-col gap-6">
                                {/* Payout Info */}
                                <div>
                                    <h4 className="text-xs font-semibold text-dash-text-secondary uppercase tracking-wider mb-3">Request Info</h4>
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-dash-border">
                                            <tr><td className="py-2 text-dash-text-secondary font-medium w-1/3">Date</td><td className="py-2 text-dash-text-primary">{date} {time}</td></tr>
                                            <tr><td className="py-2 text-dash-text-secondary font-medium">Amount</td><td className="py-2 text-dash-text-primary font-semibold">{getCurrencyMeta(detailPayout.currency).symbol}{Number(detailPayout.amount || 0).toFixed(2)}</td></tr>
                                            <tr><td className="py-2 text-dash-text-secondary font-medium">Method</td><td className="py-2 text-dash-text-primary capitalize">{detailPayout.type === 'crypto' ? 'Crypto' : 'Bank Transfer'}</td></tr>
                                            <tr><td className="py-2 text-dash-text-secondary font-medium">Account Type</td><td className="py-2 text-dash-text-primary capitalize">{detailPayout.accountType || '—'}</td></tr>
                                            <tr>
                                                <td className="py-2 text-dash-text-secondary font-medium">Status</td>
                                                <td className="py-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                                        {style.icon}
                                                        {detailPayout.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* User Info */}
                                {userObj && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-dash-text-secondary uppercase tracking-wider mb-3">User Info</h4>
                                        <table className="w-full text-sm">
                                            <tbody className="divide-y divide-dash-border">
                                                <tr><td className="py-2 text-dash-text-secondary font-medium w-1/3">Name</td><td className="py-2 text-dash-text-primary">{userObj.name || '—'}</td></tr>
                                                <tr><td className="py-2 text-dash-text-secondary font-medium">Email</td><td className="py-2 text-dash-text-primary">{userObj.email || '—'}</td></tr>
                                                {userObj.phone && <tr><td className="py-2 text-dash-text-secondary font-medium">Phone</td><td className="py-2 text-dash-text-primary">{userObj.phone}</td></tr>}
                                                {userObj.address && <tr><td className="py-2 text-dash-text-secondary font-medium">Address</td><td className="py-2 text-dash-text-primary">{userObj.address}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Payout Method Details */}
                                {detailPayout.type === 'crypto' && crypto && (crypto.token || crypto.address || crypto.memoTag) ? (
                                    <div>
                                        <h4 className="text-xs font-semibold text-dash-text-secondary uppercase tracking-wider mb-3">Crypto Withdrawal Info</h4>
                                        <table className="w-full text-sm">
                                            <tbody className="divide-y divide-dash-border">
                                                {crypto.token && <tr><td className="py-2 text-dash-text-secondary font-medium w-1/3">Token</td><td className="py-2 text-dash-text-primary uppercase font-mono">{crypto.token}</td></tr>}
                                                {crypto.address && <tr><td className="py-2 text-dash-text-secondary font-medium">Wallet Address</td><td className="py-2 text-dash-text-primary font-mono text-xs break-all">{crypto.address}</td></tr>}
                                                {crypto.memoTag && <tr><td className="py-2 text-dash-text-secondary font-medium">Memo Tag</td><td className="py-2 text-dash-text-primary font-mono">{crypto.memoTag}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : detailPayout.type === 'bank' && bank && (bank.beneficiaryName || bank.bankName || bank.accountNumber) ? (
                                    <div>
                                        <h4 className="text-xs font-semibold text-dash-text-secondary uppercase tracking-wider mb-3">Bank Transfer Info</h4>
                                        <table className="w-full text-sm">
                                            <tbody className="divide-y divide-dash-border">
                                                {bank.beneficiaryName && <tr><td className="py-2 text-dash-text-secondary font-medium w-1/3">Beneficiary</td><td className="py-2 text-dash-text-primary">{bank.beneficiaryName}</td></tr>}
                                                {bank.bankName && <tr><td className="py-2 text-dash-text-secondary font-medium">Bank Name</td><td className="py-2 text-dash-text-primary">{bank.bankName}</td></tr>}
                                                {bank.accountNumber && <tr><td className="py-2 text-dash-text-secondary font-medium">Account No.</td><td className="py-2 text-dash-text-primary font-mono">{bank.accountNumber}</td></tr>}
                                                {bank.iban && <tr><td className="py-2 text-dash-text-secondary font-medium">IBAN</td><td className="py-2 text-dash-text-primary font-mono">{bank.iban}</td></tr>}
                                                {bank.accountType && <tr><td className="py-2 text-dash-text-secondary font-medium">Account Type</td><td className="py-2 text-dash-text-primary capitalize">{bank.accountType}</td></tr>}
                                                {bank.swiftCode && <tr><td className="py-2 text-dash-text-secondary font-medium">SWIFT / BIC</td><td className="py-2 text-dash-text-primary font-mono">{bank.swiftCode}</td></tr>}
                                                {bank.routingNumber && <tr><td className="py-2 text-dash-text-secondary font-medium">Routing No.</td><td className="py-2 text-dash-text-primary font-mono">{bank.routingNumber}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-dash-text-secondary">No payout method details saved by user.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
