'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    Eye,
    Loader2,
    LockKeyhole,
    Search,
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    UserX,
    Users,
    X,
    Edit,
    Check
} from 'lucide-react';
import { authService, AdminUserRecord } from '@/app/services';
import { useAuth } from '@/app/context/AuthContext';
import UserEditModal from '@/app/components/dashboard/UserEditModal';

const LIMIT = 10;

const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function DashboardUsersPage() {
    const { user, loading: authLoading } = useAuth();

    const [users, setUsers] = useState<AdminUserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
    const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);

    const fetchUsers = useCallback(async (currentPage: number, currentStatus: 'all' | 'verified' | 'unverified') => {
        if (!user || user.role !== 0) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const params: {
                page: number;
                limit: number;
                status?: string;
            } = {
                page: currentPage,
                limit: LIMIT,
            };

            if (currentStatus === 'verified') params.status = 'true';
            if (currentStatus === 'unverified') params.status = 'false';

            const response = await authService.allUsers(params);
            const apiUsers = response?.data?.users || [];
            const pagination = response?.data?.pagination;

            setUsers(apiUsers);
            setTotalUsers(pagination?.total || 0);
            setTotalPages(pagination?.totalPages || 1);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            setError(typeof msg === 'object' ? (msg?.user || 'Failed to load users') : (msg || 'Failed to load users'));
            setUsers([]);
            setTotalUsers(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== 0) {
            setLoading(false);
            return;
        }

        fetchUsers(page, statusFilter);
    }, [authLoading, user, fetchUsers, page, statusFilter]);

    const filteredUsers = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return users;

        return users.filter((item) =>
            [
                item.name,
                item.email,
                item.phone,
                item.address,
                item.gender,
                item.accountType,
                item._id,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(search))
        );
    }, [users, query]);

    const verifiedOnPage = users.filter((item) => item.isVerified).length;
    const unverifiedOnPage = users.filter((item) => !item.isVerified).length;

    const profileRows = useMemo(() => {
        if (!selectedUser) return [] as Array<{ label: string; value: string | number }>;

        return [
            { label: 'userId', value: selectedUser._id || '-' },
            { label: 'name', value: selectedUser.name || '-' },
            { label: 'email', value: selectedUser.email || '-' },
            { label: 'phone', value: selectedUser.phone || '-' },
            { label: 'age', value: selectedUser.age ?? '-' },
            { label: 'gender', value: selectedUser.gender || '-' },
            { label: 'address', value: selectedUser.address || '-' },
            { label: 'accountType', value: selectedUser.accountType || '-' },
            { label: 'createdAt', value: formatDate(selectedUser.createdAt) },
        ];
    }, [selectedUser]);

    if (authLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center min-h-105">
                <div className="flex items-center gap-2 text-dash-text-secondary">
                    <Loader2 size={16} className="animate-spin" />
                    Loading users...
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
                        You need to be logged in to view users.
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
                        This section is only available to administrator accounts.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-dash-text-primary">Users</h2>
                <p className="text-sm text-dash-text-secondary mt-0.5">
                    Admin users list loaded from API with server pagination support.
                </p>
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 flex items-center gap-2 mb-4">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-white border border-dash-border rounded-md p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center">
                        <Users size={18} className="text-dash-active-text" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dash-text-primary">{totalUsers}</p>
                        <p className="text-xs text-dash-text-secondary">Total Users</p>
                    </div>
                </div>

                <div className="bg-white border border-dash-border rounded-md p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <UserCheck size={18} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dash-text-primary">{verifiedOnPage}</p>
                        <p className="text-xs text-dash-text-secondary">Verified (Page)</p>
                    </div>
                </div>

                <div className="bg-white border border-dash-border rounded-md p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <UserX size={18} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dash-text-primary">{unverifiedOnPage}</p>
                        <p className="text-xs text-dash-text-secondary">Unverified (Page)</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-md border border-dash-border overflow-hidden flex-1">
                <div className="p-4 border-b border-dash-border flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search current page by name, email, phone"
                            className="w-full rounded-lg border border-dash-border pl-9 pr-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(event.target.value as 'all' | 'verified' | 'unverified');
                            setPage(1);
                        }}
                        className="rounded-lg border border-dash-border px-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                    >
                        <option value="all">All Users</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-245">
                        <thead>
                            <tr className="bg-slate-50 border-b border-dash-border">
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Name</th>
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Email</th>
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Phone</th>
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Account Type</th>
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Verified</th>
                                <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Joined</th>
                                <th className="text-right text-[11px] uppercase tracking-wider text-dash-text-secondary px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dash-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center text-dash-text-secondary">
                                        <div className="inline-flex items-center gap-2">
                                            <Loader2 size={15} className="animate-spin" />
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-4 py-3 text-sm text-dash-text-primary font-medium">{item.name}</td>
                                        <td className="px-4 py-3 text-sm text-dash-text-secondary">{item.email}</td>
                                        <td className="px-4 py-3 text-sm text-dash-text-primary">{item.phone}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase ${item.accountType === 'professional' ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                {item.accountType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase ${item.isVerified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                {item.isVerified ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                                                {item.isVerified ? 'verified' : 'not verified'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-dash-text-secondary">{formatDate(item.createdAt)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingUser(item)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-dash-border text-xs font-semibold text-dash-active-text hover:bg-slate-50 transition-colors"
                                                >
                                                    <Edit size={12} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setSelectedUser(item)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-dash-border text-xs font-semibold text-dash-text-primary hover:bg-slate-50 transition-colors"
                                                >
                                                    <Eye size={12} />
                                                    Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center text-dash-text-secondary">
                                        {users.length === 0 ? 'No users found from API.' : 'No users found for current search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="py-3 px-4 border-t border-dash-border flex items-center justify-between text-[11px] bg-white">
                    <span className="text-dash-text-secondary font-inter uppercase tracking-tighter">
                        Total Results: {totalUsers} | Page: {page}/{Math.max(1, totalPages)}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page === 1 || loading}
                            className="px-2 py-1 rounded-sm border border-dash-border text-dash-text-primary hover:bg-slate-50 disabled:opacity-30"
                        >
                            Prev
                        </button>
                        <button className="px-2.5 py-1 rounded-sm bg-dash-active-text text-white font-bold">{page}</button>
                        <button
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages || loading}
                            className="px-2 py-1 rounded-sm border border-dash-border text-dash-text-primary hover:bg-slate-50 disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {editingUser && (
                <UserEditModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => {
                        setEditingUser(null);
                        fetchUsers(page, statusFilter);
                    }}
                />
            )}

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                    <div className="relative w-full max-w-3xl bg-white rounded-xl border border-dash-border shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-4 py-3 border-b border-dash-border flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h4 className="text-base font-semibold text-dash-text-primary">User Profile Detail</h4>
                                <p className="text-xs text-dash-text-secondary">Important admin profile fields from backend.</p>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-8 h-8 rounded-md border border-dash-border flex items-center justify-center text-dash-text-secondary hover:bg-slate-50 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="p-4 sm:p-5 max-h-[75vh] overflow-auto space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <p className="text-lg font-semibold text-dash-text-primary">{selectedUser.name}</p>
                                    <p className="text-sm text-dash-text-secondary">{selectedUser.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase ${selectedUser.isVerified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                        {selectedUser.isVerified ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                                        {selectedUser.isVerified ? 'verified' : 'not verified'}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase ${selectedUser.accountType === 'professional' ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                        {selectedUser.accountType}
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-md border border-dash-border">
                                <table className="w-full min-w-155">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-dash-border">
                                            <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-3 py-2">Field</th>
                                            <th className="text-left text-[11px] uppercase tracking-wider text-dash-text-secondary px-3 py-2">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dash-border">
                                        {profileRows.map((row) => (
                                            <tr key={row.label}>
                                                <td className="px-3 py-2 text-sm font-medium text-dash-text-primary">{row.label}</td>
                                                <td className="px-3 py-2 text-sm text-dash-text-secondary break-all">{String(row.value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
