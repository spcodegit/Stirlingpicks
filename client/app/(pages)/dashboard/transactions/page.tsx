'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Filter, ChevronDown, Loader2,
    CheckCircle2, Clock, XCircle, AlertCircle, RefreshCcw, Trophy, LockKeyhole, ScrollText
} from 'lucide-react';
import { orderService, OrderItem, OrderUser } from '@/app/services/orderService';
import { useAuth } from '@/app/context/AuthContext';
import PlanLogsModal from '@/app/components/transactions/PlanLogsModal';

const STATUS_OPTIONS = ['pending', 'waiting', 'partially_paid', 'finished'] as const;

const STATUS_DISPLAY: Record<string, string> = {
    pending: 'Pending',
    waiting: 'Waiting',
    partially_paid: 'Partial Paid',
    finished: 'Finalized',
    confirming: 'Pending',
    confirmed: 'Finalized',
    sending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded',
    expired: 'Expired',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    finished:      { bg: 'bg-green-50',   text: 'text-green-600',  icon: <CheckCircle2 size={12} /> },
    confirmed:     { bg: 'bg-green-50',   text: 'text-green-600',  icon: <CheckCircle2 size={12} /> },
    pending:       { bg: 'bg-gray-100',   text: 'text-gray-500',   icon: <Clock size={12} /> },
    waiting:       { bg: 'bg-yellow-50',  text: 'text-yellow-600', icon: <Clock size={12} /> },
    confirming:    { bg: 'bg-gray-100',   text: 'text-gray-500',   icon: <Clock size={12} /> },
    sending:       { bg: 'bg-gray-100',   text: 'text-gray-500',   icon: <Clock size={12} /> },
    partially_paid:{ bg: 'bg-purple-50',  text: 'text-purple-600', icon: <AlertCircle size={12} /> },
    failed:        { bg: 'bg-red-50',     text: 'text-red-600',    icon: <XCircle size={12} /> },
    refunded:      { bg: 'bg-teal-50',    text: 'text-teal-600',   icon: <RefreshCcw size={12} /> },
    expired:       { bg: 'bg-red-50',     text: 'text-red-400',    icon: <XCircle size={12} /> },
};

const formatDateTime = (date: string) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return { date: '-', time: '' };
    return {
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    };
};

const getUserInfo = (userId: OrderItem['userId']): { name: string; email: string } => {
    if (typeof userId === 'object' && userId !== null) {
        return { name: (userId as OrderUser).name || '-', email: (userId as OrderUser).email || '-' };
    }
    return { name: '-', email: '-' };
};

export default function TransactionsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 0;

    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 20;
    const [planLogsOpen, setPlanLogsOpen] = useState(false);
    const [planLogsContext, setPlanLogsContext] = useState<{ userId: string; orderId: string }>({ userId: '', orderId: '' });

    const fetchOrders = useCallback(async (currentPage: number, status: string) => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const filters = status !== 'All' ? { status } : undefined;
            const response = await orderService.getAll(currentPage, LIMIT, filters);
            const result = response?.data;
            setOrders(result?.data || []);
            setTotal(result?.pagination?.total || 0);
            setTotalPages(result?.pagination?.totalPages || 1);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            setError(typeof msg === 'object' ? (msg.user || 'Failed to load transactions') : (msg || 'Failed to load transactions'));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchOrders(page, statusFilter);
    }, [fetchOrders, page, statusFilter]);

    const filtered = orders.filter(o => {
        if (!searchTerm) return true;
        const { name, email } = getUserInfo(o.userId);
        return [o.customOrderId, o._id, o.paymentMethod, o.accountType, name, email]
            .some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const colSpan = isAdmin ? 10 : 7;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <LockKeyhole size={28} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-dash-text-primary">Login Required</h3>
                <p className="text-sm text-dash-text-secondary max-w-xs">You need to be logged in to view transactions.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-dash-text-primary tracking-tight">
                        {isAdmin ? 'All Transactions' : 'Transaction History'}
                    </h2>
                    <p className="text-sm text-dash-text-secondary mt-0.5">
                        {isAdmin ? 'View and monitor all deposit transactions.' : 'Track all deposit transactions on your account.'}
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
                        placeholder="Search by order ID, user, method…"
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
                            <option key={s} value={s}>{STATUS_DISPLAY[s] || s}</option>
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
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Order ID</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Amount</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Currency</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Method</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Account</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 font-semibold text-dash-text-secondary text-xs uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dash-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={colSpan} className="py-20 text-center">
                                        <div className="flex items-center justify-center gap-2 text-dash-text-secondary">
                                            <Loader2 size={16} className="animate-spin" />
                                            Loading transactions…
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={colSpan} className="py-16 text-center text-red-500 text-sm">{error}</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={colSpan} className="py-16 text-center text-dash-text-secondary text-sm">No transactions found.</td>
                                </tr>
                            ) : (
                                filtered.map(order => {
                                    const style = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
                                    const { name, email } = getUserInfo(order.userId);
                                    const { date, time } = formatDateTime(order.createdAt);
                                    const currency = order.paymentInfo?.pay_currency?.toUpperCase() || '—';
                                    return (
                                        <tr key={order._id} className="hover:bg-gray-50/60 transition-colors">
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
                                                <div className="text-xs font-mono text-dash-text-primary">{order.customOrderId || order._id}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap font-semibold text-dash-text-primary">
                                                ${Number(order.amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs font-semibold text-dash-text-primary">{currency}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs capitalize text-dash-text-secondary">{order.paymentMethod || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs capitalize text-dash-text-secondary">{order.accountType || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                                    {style.icon}
                                                    {STATUS_DISPLAY[order.status] || order.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                {order.accountType === 'professional' && (
                                                    <button
                                                        type="button"
                                                        title="View Plan Logs"
                                                        onClick={() => {
                                                            const uid = typeof order.userId === 'object' && order.userId !== null
                                                                ? (order.userId as OrderUser)._id
                                                                : (order.userId as string);
                                                            setPlanLogsContext({ userId: uid || '', orderId: order._id });
                                                            setPlanLogsOpen(true);
                                                        }}
                                                        className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-colors rounded-md cursor-pointer"
                                                    >
                                                        <ScrollText size={15} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-dash-border flex items-center justify-between text-xs text-dash-text-secondary bg-gray-50/50">
                    <span>Showing {filtered.length} of {total} transactions</span>
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

            <PlanLogsModal
                open={planLogsOpen}
                userId={planLogsContext.userId}
                orderId={planLogsContext.orderId}
                onClose={() => setPlanLogsOpen(false)}
                variant="dashboard"
            />
        </div>
    );
}

