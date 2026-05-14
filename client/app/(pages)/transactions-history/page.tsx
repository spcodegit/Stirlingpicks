'use client';
import React, { useEffect, useState } from 'react';
import { PublicLayout } from '@/app/components/layout';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Clock, CheckCircle2, XCircle, AlertCircle, Search, Filter, Download, Calendar, ChevronDown, CreditCard, Loader2, ScrollText } from 'lucide-react';
import { orderService, OrderItem } from '@/app/services';
import RowActionMenu from '@/app/components/transactions/RowActionMenu';
import TransactionDetailsModal from '@/app/components/transactions/TransactionDetailsModal';
import PlanLogsModal from '@/app/components/transactions/PlanLogsModal';

interface UiTransaction {
    rawId: string;
    id: string;
    date: string;
    type: string;
    amount: number;
    method: string;
    status: string;
    details: string;
    rawStatus?: string;
    payAddress?: string;
    payAmount?: number;
    payCurrency?: string;
    payinExtraId?: string;
    priceAmount?: number;
    accountType?: string;
    rawUserId?: string;
}

const normalizeStatus = (status: string) => {
    const value = (status || '').toLowerCase();
    if (value === 'finished' || value === 'confirmed') return 'finalized';
    if (value === 'failed' || value === 'expired' || value === 'refunded') return 'failed';
    if (value === 'partially_paid') return 'partial paid';
    if (value === 'waiting') return 'waiting';
    if (value === 'pending' || value === 'confirming' || value === 'sending') return 'pending';
    return value || 'pending';
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

const toUiTransaction = (order: OrderItem): UiTransaction => {
    const payCurrency = order?.paymentInfo?.pay_currency?.toUpperCase();
    const method = order.paymentMethod === 'crypto'
        ? `Crypto${payCurrency ? ` (${payCurrency})` : ''}`
        : (order.paymentMethod || 'Wallet');

    return {
        rawId: order._id,
        id: order.customOrderId || order._id,
        date: formatDate(order.createdAt),
        type: 'Deposit',
        amount: Number(order.amount) || 0,
        method,
        status: normalizeStatus(order.status),
        details: order.feedback || `Deposit for ${order.accountType} account`,
        rawStatus: order.status,
        payAddress: order?.paymentInfo?.pay_address || '',
        payAmount: Number(order?.paymentInfo?.pay_amount) || 0,
        payCurrency: order?.paymentInfo?.pay_currency?.toUpperCase() || '',
        payinExtraId: order?.paymentInfo?.payin_extra_id || '',
        priceAmount: Number(order?.paymentInfo?.price_amount) || Number(order.amount) || 0,
        accountType: order.accountType,
        rawUserId: typeof order.userId === 'string' ? order.userId : (order.userId as { _id?: string })?._id || '',
    };
};

export default function TransactionsHistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [transactions, setTransactions] = useState<UiTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<UiTransaction | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [planLogsOpen, setPlanLogsOpen] = useState(false);
    const [planLogsContext, setPlanLogsContext] = useState<{ userId: string; orderId: string }>({ userId: '', orderId: '' });

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setTransactions([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await orderService.getAll(1, 100);
                const orders = response?.data?.data || [];
                const mapped = orders.map(toUiTransaction);
                setTransactions(mapped);
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string | { user?: string } } } };
                const message = error?.response?.data?.message;
                setError(typeof message === 'object' ? (message.user || 'Failed to load transactions') : (message || 'Failed to load transactions'));
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleViewOrderById = async (id: string) => {
        try {
            setDetailsLoading(true);
            const response = await orderService.getById(id);
            const order = response?.data;
            if (!order) return;
            setSelectedOrder(toUiTransaction(order));
            setIsDetailsModalOpen(true);
        } catch {
            // keep current list visible even if details call fails
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch = txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             txn.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' ||
                           txn.type.toLowerCase().includes(filterType.toLowerCase());
        return matchesSearch && matchesType;
    });

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'finalized':
                return {
                    bg: 'bg-green-500/20',
                    text: 'text-green-500',
                    icon: <CheckCircle2 size={14} />
                };
            case 'pending':
                return {
                    bg: 'bg-[var(--bg-yellow-primary)]/10',
                    text: 'text-[var(--bg-yellow-primary)]',
                    icon: <Clock size={14} />
                };
            case 'waiting':
                return {
                    bg: 'bg-orange-500/10',
                    text: 'text-orange-400',
                    icon: <Clock size={14} />
                };
            case 'partial paid':
                return {
                    bg: 'bg-purple-500/10',
                    text: 'text-purple-400',
                    icon: <AlertCircle size={14} />
                };
            case 'failed':
            case 'cancelled':
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

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'deposit':
                return <ArrowDownLeft className="text-[var(--bg-green-primary)]" size={18} />;
            case 'withdrawal':
                return <ArrowUpRight className="text-red-500" size={18} />;
            case 'bet placement':
                return <ArrowRightLeft className="text-[var(--bg-yellow-primary)]" size={18} />;
            case 'bet won':
                return <ArrowDownLeft className="text-[var(--bg-green-primary)]" size={18} />;
            default:
                return <ArrowRightLeft className="text-gray-400" size={18} />;
        }
    };

    return (
        <PublicLayout isSubPage={true}>
            <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">
                <div className="p-4 md:p-6 pb-0 flex-shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold text-white uppercase tracking-wider mb-1">
                                Transactions <span className="text-[var(--bg-yellow-primary)]">History</span>
                            </h1>
                            <p className="text-[var(--text-muted)] font-inter text-[12px]">
                                Keep track of all your deposits, withdrawals, and betting activities.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-white px-3 py-2 rounded-sm border border-[var(--border-primary)] transition-all text-xs font-medium">
                                <Download size={14} />
                                <span>Export</span>
                            </button>
                            <button className="bg-[var(--bg-green-primary)] hover:bg-[var(--bg-green-primary)]/90 text-[var(--bg-navy-secondary)] px-4 py-2 rounded-sm font-bold transition-all text-xs flex items-center gap-2">
                                <CreditCard size={14} />
                                <span>Deposit</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <input
                                type="text"
                                placeholder="Search transactions..."
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
                                <option value="All">All Transactions</option>
                                <option value="Deposit">Deposits</option>
                                <option value="Withdrawal">Withdrawals</option>
                                <option value="Bet">Bets</option>
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
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Method</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Amount</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Account</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Status</th>
                                        <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-primary)]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] font-inter text-sm">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Loading transactions...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <p className="text-red-400 font-inter text-sm">{error}</p>
                                            </td>
                                        </tr>
                                    ) : filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((txn) => {
                                            const statusStyle = getStatusStyles(txn.status);
                                            return (
                                                <tr key={txn.rawId} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="text-white font-inter text-[12px] font-medium">{txn.date.split(' ')[0]}</div>
                                                        <div className="text-[var(--text-muted)] font-inter text-[10px]">{txn.date.split(' ')[1]}</div>
                                                    </td>
                                                    <td className="py-4 px-4 font-inter text-[12px] text-white font-semibold">
                                                        {txn.id}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center">
                                                                {getTypeIcon(txn.type)}
                                                            </div>
                                                            <span className="text-white font-inter text-[12px] font-medium">{txn.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[var(--text-muted)] font-inter text-[12px]">{txn.method}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 font-orbitron text-[12px] font-bold">
                                                        <span className={txn.amount > 0 ? 'text-[var(--bg-green-primary)]' : 'text-white'}>
                                                            {txn.amount > 0 ? '+' : ''}${Math.abs(txn.amount).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-[var(--text-muted)] font-inter text-[11px] uppercase tracking-wider font-bold">{txn.accountType || '-'}</span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-black/5 ${statusStyle.bg} ${statusStyle.text} font-inter text-[10px] font-bold uppercase tracking-wider`}>
                                                            {txn.status}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {txn.accountType === 'professional' && (
                                                                <button
                                                                    type="button"
                                                                    title="View Plan Logs"
                                                                    onClick={() => {
                                                                        setPlanLogsContext({ userId: txn.rawUserId || '', orderId: txn.rawId });
                                                                        setPlanLogsOpen(true);
                                                                    }}
                                                                    className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors rounded-sm cursor-pointer"
                                                                >
                                                                    <ScrollText size={15} />
                                                                </button>
                                                            )}
                                                            <RowActionMenu onDetails={() => handleViewOrderById(txn.rawId)} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <p className="text-[var(--text-muted)] font-inter text-sm opacity-50 uppercase tracking-widest font-bold">No Records Found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="py-3 px-4 border-t border-[var(--border-primary)] flex items-center justify-between text-[11px] bg-[var(--bg-secondary)] flex-shrink-0">
                            <span className="text-[var(--text-muted)] font-inter uppercase tracking-tighter">Total Results: {filteredTransactions.length}</span>
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
                    transaction={selectedOrder}
                    onClose={() => setIsDetailsModalOpen(false)}
                />

                <PlanLogsModal
                    open={planLogsOpen}
                    userId={planLogsContext.userId}
                    orderId={planLogsContext.orderId}
                    onClose={() => setPlanLogsOpen(false)}
                    variant="public"
                />
            </div>
        </PublicLayout>
    );
}
