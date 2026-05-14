'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, LifeBuoy, Clock3, CheckCircle2, AlertTriangle, Eye, X, Loader2, ChevronDown, AlertCircle, XCircle, Trash2 } from 'lucide-react';
import { supportService, SupportItem } from '@/app/services';
import { useAuth } from '@/app/context/AuthContext';

type SupportStatus = 'placed' | 'pending' | 'complete' | 'rejected';
type SupportUser = { _id: string; name: string; email: string };

const STATUS_OPTIONS: SupportStatus[] = ['placed', 'pending', 'complete', 'rejected'];

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    placed:   { bg: 'bg-gray-100',   text: 'text-gray-600',   icon: <Clock3 size={12} /> },
    pending:  { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: <Clock3 size={12} /> },
    complete: { bg: 'bg-green-100',  text: 'text-green-700',  icon: <CheckCircle2 size={12} /> },
    rejected: { bg: 'bg-red-50',     text: 'text-red-600',    icon: <XCircle size={12} /> },
};

const getUserInfo = (userId: SupportItem['userId']): { name: string; email: string } => {
    if (typeof userId === 'object' && userId !== null) {
        return { name: (userId as SupportUser).name || '-', email: (userId as SupportUser).email || '-' };
    }
    return { name: '-', email: '-' };
};

const formatDateTime = (date: string) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '-';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function DashboardSupportPage() {
    const { user } = useAuth();

    const [tickets, setTickets] = useState<SupportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | SupportStatus>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedTicket, setSelectedTicket] = useState<SupportItem | null>(null);
    const [updatingId, setUpdatingId] = useState('');
    const [updateMsg, setUpdateMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);
    const [deletingId, setDeletingId] = useState('');
    const LIMIT = 20;

    const fetchTickets = useCallback(async (page: number) => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const response = await supportService.getAll(page, LIMIT);
            const result = response?.data;
            setTickets(result?.data || []);
            setTotal(result?.pagination?.total || 0);
            setTotalPages(result?.pagination?.totalPages || 1);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            setError(typeof msg === 'object' ? (msg.user || 'Failed to load support tickets') : (msg || 'Failed to load support tickets'));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTickets(currentPage);
    }, [fetchTickets, currentPage]);

    const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
        setUpdatingId(ticketId);
        setUpdateMsg(null);
        try {
            const response = await supportService.update(ticketId, { status: newStatus });
            if (response?.status === 200 || response?.status === 201) {
                setUpdateMsg({ id: ticketId, type: 'success', text: response?.message || 'Status updated' });
                fetchTickets(currentPage);
            } else {
                const msg = response?.message;
                const errorText = typeof msg === 'object' ? ((msg as { user?: string }).user || 'Failed to update') : (msg || 'Failed to update');
                setUpdateMsg({ id: ticketId, type: 'error', text: errorText });
            }
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            const errorText = typeof msg === 'object' ? (msg.user || 'Failed to update') : (msg || 'Failed to update');
            setUpdateMsg({ id: ticketId, type: 'error', text: errorText });
        } finally {
            setUpdatingId('');
            setTimeout(() => setUpdateMsg(null), 3000);
        }
    };

    const handleDelete = async (ticketId: string) => {
        if (!confirm('Are you sure you want to delete this support ticket?')) return;
        setDeletingId(ticketId);
        setUpdateMsg(null);
        try {
            const response = await supportService.delete(ticketId);
            if (response?.status === 200 || response?.status === 201) {
                setUpdateMsg({ id: ticketId, type: 'success', text: response?.message || 'Support ticket deleted' });
                fetchTickets(currentPage);
            } else {
                const msg = response?.message;
                const errorText = typeof msg === 'object' ? ((msg as { user?: string }).user || 'Failed to delete') : (msg || 'Failed to delete');
                setUpdateMsg({ id: ticketId, type: 'error', text: errorText });
            }
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            const errorText = typeof msg === 'object' ? (msg.user || 'Failed to delete') : (msg || 'Failed to delete');
            setUpdateMsg({ id: ticketId, type: 'error', text: errorText });
        } finally {
            setDeletingId('');
            setTimeout(() => setUpdateMsg(null), 3000);
        }
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            const q = query.toLowerCase();
            const { name, email } = getUserInfo(ticket.userId);
            const matchesQuery =
                ticket._id.toLowerCase().includes(q) ||
                name.toLowerCase().includes(q) ||
                email.toLowerCase().includes(q) ||
                ticket.message.toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
    }, [tickets, query, statusFilter]);

    const placedCount = tickets.filter((t) => t.status === 'placed').length;
    const pendingCount = tickets.filter((t) => t.status === 'pending').length;
    const completeCount = tickets.filter((t) => t.status === 'complete').length;

    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-dash-text-primary">Support</h2>
                <p className="text-sm text-dash-text-secondary mt-0.5">
                    Manage user support tickets from a single dashboard page.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-white border border-dash-border rounded-md p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-red-50 flex items-center justify-center">
                        <AlertTriangle size={18} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dash-text-primary">{placedCount}</p>
                        <p className="text-xs text-dash-text-secondary">Placed</p>
                    </div>
                </div>

                <div className="bg-white border border-dash-border rounded-md p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-amber-50 flex items-center justify-center">
                        <Clock3 size={18} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dash-text-primary">{pendingCount}</p>
                        <p className="text-xs text-dash-text-secondary">Pending</p>
                    </div>
                </div>

                <div className="bg-white border border-dash-border rounded-md p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-green-50 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dash-text-primary">{completeCount}</p>
                        <p className="text-xs text-dash-text-secondary">Complete</p>
                    </div>
                </div>
            </div>

            {/* Update Message Toast */}
            {updateMsg && (
                <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${updateMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {updateMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {updateMsg.text}
                </div>
            )}

            <div className="bg-white rounded-md border border-dash-border overflow-hidden flex-1">
                <div className="p-4 border-b border-dash-border flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                            }}
                            placeholder="Search by user, email, or message"
                            className="w-full rounded-lg border border-dash-border pl-9 pr-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as 'all' | SupportStatus);
                        }}
                        className="rounded-lg border border-dash-border px-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                    >
                        <option value="all">All Statuses</option>
                        <option value="placed">Placed</option>
                        <option value="pending">Pending</option>
                        <option value="complete">Complete</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-dash-border">
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">User</th>
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Email</th>
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Message</th>
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Created</th>
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Status</th>
                                <th className="text-right text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-dash-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex items-center justify-center gap-2 text-dash-text-secondary">
                                            <Loader2 size={16} className="animate-spin" />
                                            Loading support tickets…
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16 text-center text-red-500 text-sm">{error}</td>
                                </tr>
                            ) : filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => {
                                    const { name, email } = getUserInfo(ticket.userId);
                                    const style = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.placed;
                                    return (
                                        <tr key={ticket._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 text-sm text-dash-text-primary">{name}</td>
                                            <td className="px-4 py-3 text-sm text-dash-text-secondary">{email}</td>
                                            <td className="px-4 py-3 text-sm text-dash-text-primary max-w-[250px] truncate">{ticket.message}</td>
                                            <td className="px-4 py-3 text-sm text-dash-text-secondary whitespace-nowrap">{formatDateTime(ticket.createdAt)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                                        {style.icon}
                                                        {ticket.status}
                                                    </span>
                                                    <div className="relative">
                                                        <select
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value) handleStatusUpdate(ticket._id, e.target.value);
                                                            }}
                                                            disabled={updatingId === ticket._id}
                                                            className="text-xs bg-white border border-dash-border rounded-md px-2 py-1 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-wait"
                                                        >
                                                            <option value="">Update</option>
                                                            {STATUS_OPTIONS.filter(s => s !== ticket.status).map(s => (
                                                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                    {updatingId === ticket._id && <Loader2 size={14} className="animate-spin text-blue-500" />}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTicket(ticket)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-dash-border text-dash-text-secondary hover:text-dash-active-text hover:border-dash-active-text hover:bg-blue-50 transition-all"
                                                        aria-label="View support details"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(ticket._id)}
                                                        disabled={deletingId === ticket._id}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-dash-border text-dash-text-secondary hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-wait"
                                                        aria-label="Delete support ticket"
                                                    >
                                                        {deletingId === ticket._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16 text-center text-dash-text-secondary">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <LifeBuoy size={32} className="opacity-30" />
                                            <p>No support tickets found for current filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="py-3 px-4 border-t border-dash-border flex items-center justify-between text-[11px] bg-white">
                    <span className="text-dash-text-secondary font-inter uppercase tracking-tighter">
                        Showing {filteredTickets.length} of {total} results
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-2 py-1 rounded-sm border border-dash-border text-dash-text-primary hover:bg-slate-50 disabled:opacity-30"
                        >
                            Prev
                        </button>
                        <button className="px-2.5 py-1 rounded-sm bg-dash-active-text text-white font-bold">{currentPage}</button>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="px-2 py-1 rounded-sm border border-dash-border text-dash-text-primary hover:bg-slate-50 disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedTicket(null)}></div>

                    <div className="relative w-full max-w-2xl bg-white rounded-md border border-dash-border shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-dash-border flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-dash-text-primary">Support Details</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedTicket(null)}
                                className="w-8 h-8 rounded-md border border-dash-border text-dash-text-secondary hover:text-dash-text-primary hover:bg-slate-50 transition-all flex items-center justify-center"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 sm:p-5 space-y-3 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-slate-50 border border-dash-border rounded-md p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-dash-text-secondary">Name</p>
                                    <p className="text-sm font-semibold text-dash-text-primary">{getUserInfo(selectedTicket.userId).name}</p>
                                </div>
                                <div className="bg-slate-50 border border-dash-border rounded-md p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-dash-text-secondary">Email</p>
                                    <p className="text-sm font-semibold text-dash-text-primary break-all">{getUserInfo(selectedTicket.userId).email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-slate-50 border border-dash-border rounded-md p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-dash-text-secondary">Status</p>
                                    <p className="text-sm font-semibold text-dash-text-primary capitalize">{selectedTicket.status}</p>
                                </div>
                                <div className="bg-slate-50 border border-dash-border rounded-md p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-dash-text-secondary">Created At</p>
                                    <p className="text-sm font-semibold text-dash-text-primary">{formatDateTime(selectedTicket.createdAt)}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-dash-border rounded-md p-3">
                                <p className="text-[10px] uppercase tracking-wider text-dash-text-secondary">Full Message</p>
                                <p className="text-sm text-dash-text-primary leading-relaxed">{selectedTicket.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
