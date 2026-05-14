'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Loader2, Check } from 'lucide-react';
import { authService, AdminUserRecord } from '@/app/services';

interface UserEditModalProps {
    user: AdminUserRecord;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UserEditModal({ user, onClose, onSuccess }: UserEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || 0,
        gender: user.gender || '',
        address: user.address || '',
        walletS: user.walletS || 0,
        walletP: user.walletP || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' || name === 'walletS' || name === 'walletP' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                age: formData.age,
                gender: formData.gender,
                address: formData.address,
                walletS: formData.walletS,
                walletP: formData.walletP,
            };

            const response = await authService.updateProfile(user._id, payload);
            if (response.status === 200 || response.status === 201) {
                onSuccess();
            } else {
                setError(typeof response.message === 'object' ? response.message.user || 'Update failed' : response.message || 'Update failed');
            }
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string; system?: string } } } };
            const msg = apiErr?.response?.data?.message;
            const errorText = typeof msg === 'object' ? msg?.user || msg?.system || 'Failed to update user' : msg || 'Failed to update user';
            setError(errorText);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-xl border border-dash-border shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b border-dash-border flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h4 className="text-base font-semibold text-dash-text-primary">Edit User Profile</h4>
                        <p className="text-xs text-dash-text-secondary">Update user details and account balances.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-md border border-dash-border flex items-center justify-center text-dash-text-secondary hover:bg-slate-50 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 max-h-[80vh] overflow-auto">
                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">Full Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-dash-border px-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-dash-border px-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">Phone Number</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-dash-border px-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-dash-border px-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-dash-border px-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">Address</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-dash-border px-3 py-2 text-sm text-dash-text-primary focus:outline-none focus:border-dash-active-text"
                            />
                        </div>

                        <div className="sm:col-span-2 pt-2">
                            <div className="border-t border-dash-border pt-4 mb-2">
                                <h5 className="text-sm font-bold text-dash-text-primary uppercase tracking-tight">Financial Balances</h5>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">Standard Wallet ($)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-secondary text-sm">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="walletS"
                                    value={formData.walletS}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-dash-border pl-7 pr-3 py-2 text-sm text-dash-text-primary font-mono focus:outline-none focus:border-dash-active-text"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">Professional Wallet ($)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-secondary text-sm">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="walletP"
                                    value={formData.walletP}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-dash-border pl-7 pr-3 py-2 text-sm text-dash-text-primary font-mono focus:outline-none focus:border-dash-active-text"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-dash-border text-sm font-semibold text-dash-text-primary hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-dash-active-text text-sm font-bold text-white hover:bg-dash-active-text/90 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Check size={16} />
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
