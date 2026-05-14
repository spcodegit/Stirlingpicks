'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Save, Loader2, AlertCircle, Trash2, Pencil, Search } from 'lucide-react';
import { planService, PlanRecord } from '@/app/services';
import PlanPreviewTable from '@/app/components/plans/PlanPreviewTable';

export default function LeaderboardPage() {
    const [plans, setPlans] = useState<PlanRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        amount: 500,
        bettingDays: 30,
        minBettingDays: 5,
        dailyDrawDownMax: 50,
        drawDown: 100,
        fee: 95
    });

    const fetchPlans = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const response = await planService.getAll();
            setPlans(response.data || []);
        } catch (err) {
            setError('Failed to fetch plans');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans(false);
    }, [fetchPlans]);

    const openAddModal = () => {
        setModalMode('add');
        setFormData({
            amount: 500,
            bettingDays: 30,
            minBettingDays: 5,
            dailyDrawDownMax: 50,
            drawDown: 100,
            fee: 95
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            if (modalMode === 'add') {
                await planService.create(formData);
            } else if (selectedId) {
                await planService.update(selectedId, formData);
            }
            setIsModalOpen(false);
            fetchPlans(true);
        } catch (err) {
            console.error(err);
            alert('Failed to save plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            await planService.remove(id);
            fetchPlans(true);
        } catch (err) {
            console.error(err);
            alert('Failed to delete plan');
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-dash-text-primary">Leaderboard & Plans</h2>
                    <p className="text-sm text-dash-text-secondary mt-0.5">
                        Manage your betting plans and view current leaderboard statistics.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-dash-active-text hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors cursor-pointer"
                >
                    <Plus size={16} />
                    Create Plan
                </button>
            </div>
            

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-white border border-dash-border rounded-md p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center">
                        <Plus size={18} className="text-dash-active-text" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dash-text-primary">{plans.length}</p>
                        <p className="text-xs text-dash-text-secondary font-bold uppercase tracking-wider">Total Active Plans</p>
                    </div>
                </div>
            </div>
  {/* Plans Table (Admin Section) */}
            <div className="bg-white rounded-md border border-dash-border overflow-hidden">
                <div className="p-4 border-b border-dash-border">
                    <h3 className="font-bold text-dash-text-primary">Plan Management</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-dash-border text-left">
                                <th className="px-4 py-3 text-[11px] uppercase font-bold text-dash-text-secondary">Amount</th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold text-dash-text-secondary">Betting Days</th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold text-dash-text-secondary">Min Betting Days</th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold text-dash-text-secondary">Daily Drawdown</th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold text-dash-text-secondary">Max Drawdown</th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold text-dash-text-secondary">Fee</th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold text-dash-text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dash-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-dash-text-secondary">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading plans...
                                    </td>
                                </tr>
                            ) : !Array.isArray(plans) || plans.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-dash-text-secondary">
                                        No plans found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                plans.map((plan) => (
                                    <tr key={plan._id} className="hover:bg-slate-50 transition-colors text-sm">
                                        <td className="px-4 py-3 font-semibold text-dash-text-primary">${plan.amount}</td>
                                        <td className="px-4 py-3 text-dash-text-secondary">{plan.bettingDays} Days</td>
                                        <td className="px-4 py-3 text-dash-text-secondary">{plan.minBettingDays} Days</td>
                                        <td className="px-4 py-3 text-dash-text-secondary">${plan.dailyDrawDownMax}</td>
                                        <td className="px-4 py-3 text-dash-text-secondary">${plan.drawDown}</td>
                                        <td className="px-4 py-3 text-dash-text-secondary">${plan.fee}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedId(plan._id);
                                                        setFormData({
                                                            amount: plan.amount,
                                                            bettingDays: plan.bettingDays,
                                                            minBettingDays: plan.minBettingDays,
                                                            dailyDrawDownMax: plan.dailyDrawDownMax,
                                                            drawDown: plan.drawDown,
                                                            fee: plan.fee
                                                        });
                                                        setModalMode('edit');
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-md border border-dash-border hover:bg-blue-50 hover:text-dash-active-text transition-all"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(plan._id)}
                                                    className="p-1.5 rounded-md border border-dash-border hover:bg-red-50 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Visual Plans Grid (Top Section) */}
            <div className="max-w-[1200px] mx-auto w-full mb-12 mt-12">
                <div className="flex justify-center mb-10">
                    <h3 className="font-bold text-dash-text-primary text-xl uppercase tracking-wider">Preview</h3>
                </div>

                <PlanPreviewTable plans={plans} loading={loading} variant="dashboard" />
            </div>



            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-dash-border overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dash-border bg-gray-50">
                            <h3 className="font-bold text-dash-text-primary text-[15px]">
                                {modalMode === 'add' ? 'Create New Plan' : 'Edit Plan'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-dash-text-secondary uppercase">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        className="w-full h-10 px-3 border border-dash-border rounded-md text-sm focus:outline-none focus:border-dash-active-text"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-dash-text-secondary uppercase">Fee ($)</label>
                                    <input
                                        type="number"
                                        value={formData.fee}
                                        onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                                        className="w-full h-10 px-3 border border-dash-border rounded-md text-sm focus:outline-none focus:border-dash-active-text"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-dash-text-secondary uppercase">Betting Days</label>
                                    <input
                                        type="number"
                                        value={formData.bettingDays}
                                        onChange={(e) => setFormData({ ...formData, bettingDays: Number(e.target.value) })}
                                        className="w-full h-10 px-3 border border-dash-border rounded-md text-sm focus:outline-none focus:border-dash-active-text"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-dash-text-secondary uppercase">Min Betting Days</label>
                                    <input
                                        type="number"
                                        value={formData.minBettingDays}
                                        onChange={(e) => setFormData({ ...formData, minBettingDays: Number(e.target.value) })}
                                        className="w-full h-10 px-3 border border-dash-border rounded-md text-sm focus:outline-none focus:border-dash-active-text"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-dash-text-secondary uppercase">Daily Drawdown ($)</label>
                                    <input
                                        type="number"
                                        value={formData.dailyDrawDownMax}
                                        onChange={(e) => setFormData({ ...formData, dailyDrawDownMax: Number(e.target.value) })}
                                        className="w-full h-10 px-3 border border-dash-border rounded-md text-sm focus:outline-none focus:border-dash-active-text"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-dash-text-secondary uppercase">Max Drawdown ($)</label>
                                    <input
                                        type="number"
                                        value={formData.drawDown}
                                        onChange={(e) => setFormData({ ...formData, drawDown: Number(e.target.value) })}
                                        className="w-full h-10 px-3 border border-dash-border rounded-md text-sm focus:outline-none focus:border-dash-active-text"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dash-border bg-gray-50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-dash-text-secondary hover:text-dash-text-primary border border-dash-border rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-5 py-2 bg-dash-active-text hover:bg-blue-700 text-white text-sm font-bold rounded-md transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {modalMode === 'add' ? 'Create Plan' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

