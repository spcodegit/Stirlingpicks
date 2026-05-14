'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { User, Mail, ShieldAlert, Wallet, CreditCard, Lock, Save, Camera, ChevronRight, BadgeCheck, Clock, Bitcoin, Building2, CheckCircle2, ChevronDown, AlertCircle, Hash, Search, Coins, Loader2,  XCircle, Ban } from 'lucide-react';
import { authService, nowPaymentService } from '@/app/services/authService';
import { payoutService, PayoutItem } from '@/app/services/payoutService';

const formatPayoutDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '-';
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const hh = String(parsed.getHours()).padStart(2, '0');
    const min = String(parsed.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const getPayoutStatusStyles = (status: string) => {
    switch (status) {
        case 'complete':
            return { bg: 'bg-[var(--bg-green-primary)]/10', text: 'text-[var(--bg-green-primary)]', icon: <CheckCircle2 size={12} /> };
        case 'pending':
        case 'placed':
            return { bg: 'bg-[var(--bg-yellow-primary)]/10', text: 'text-[var(--bg-yellow-primary)]', icon: <Clock size={12} /> };
        case 'rejected':
            return { bg: 'bg-red-500/10', text: 'text-red-500', icon: <XCircle size={12} /> };
        default:
            return { bg: 'bg-gray-500/10', text: 'text-gray-400', icon: <Clock size={12} /> };
    }
};

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [isPersonalSaving, setIsPersonalSaving] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    const [personalForm, setPersonalForm] = useState({
        name: '',
        address: '',
        phone: '',
        age: '',
    });
    const [personalMessage, setPersonalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Payout method selection
    const [payoutMethod, setPayoutMethod] = useState<'crypto' | 'bank'>('crypto');
    const [isPayoutSaving, setIsPayoutSaving] = useState(false);
    const [payoutMessage, setPayoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Crypto form (profile payout details - saved to user)
    const [cryptoForm, setCryptoForm] = useState({
        tokenType: '',
        walletAddress: '',
        memoTag: '',
    });

    // Bank form (profile payout details - saved to user)
    const [bankForm, setBankForm] = useState({
        beneficiaryName: '',
        bankName: '',
        accountNumber: '',
        iban: '',
        bankAccountType: '' as string,
        swiftCode: '',
        routingNumber: '',
    });

    // Dynamic currencies from API
    const [currencies, setCurrencies] = useState<string[]>([]);
    const [currenciesLoading, setCurrenciesLoading] = useState(false);
    const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
    const [tokenSearchTerm, setTokenSearchTerm] = useState('');

    // Payout history
    const [payoutHistory, setPayoutHistory] = useState<PayoutItem[]>([]);
    const [payoutHistoryLoading, setPayoutHistoryLoading] = useState(false);

    const filteredCurrencies = currencies.filter((curr: string) =>
        curr.toLowerCase().includes(tokenSearchTerm.toLowerCase())
    );

    useEffect(() => {
        setPersonalForm({
            name: user?.name || '',
            address: user?.address || '',
            phone: user?.phone || '',
            age: user?.age ? String(user.age) : '',
        });
    }, [user]);

    // Pre-populate payout forms from user data
    useEffect(() => {
        if (user) {
            const crypto = user.payOutCrypto;
            const bank = user.payOutBank;
            setCryptoForm({
                tokenType: crypto?.token || '',
                walletAddress: crypto?.address || '',
                memoTag: crypto?.memoTag || '',
            });
            setBankForm({
                beneficiaryName: bank?.beneficiaryName || '',
                bankName: bank?.bankName || '',
                accountNumber: bank?.accountNumber || '',
                iban: bank?.iban || '',
                bankAccountType: bank?.accountType || '',
                swiftCode: bank?.swiftCode || '',
                routingNumber: bank?.routingNumber || '',
            });
        }
    }, [user]);

    // Fetch payout history when payout tab is active
    useEffect(() => {
        if (activeTab === 'payout') {
            const fetchHistory = async () => {
                const token = localStorage.getItem('token');
                if (!token) return;
                setPayoutHistoryLoading(true);
                try {
                    const response = await payoutService.getAll(1, 100);
                    setPayoutHistory(response?.data?.data || []);
                } catch {
                    // silently fail
                } finally {
                    setPayoutHistoryLoading(false);
                }
            };
            fetchHistory();
        }
    }, [activeTab]);

    // Fetch currencies when payout tab is active
    useEffect(() => {
        if (activeTab === 'payout' && payoutMethod === 'crypto' && currencies.length === 0) {
            const fetchCurrencies = async () => {
                setCurrenciesLoading(true);
                try {
                    const response = await nowPaymentService.allCurrencies();
                    const list = response?.data?.currencies || [];
                    setCurrencies(list);
                } catch {
                    // silently fail
                } finally {
                    setCurrenciesLoading(false);
                }
            };
            fetchCurrencies();
        }
    }, [activeTab, payoutMethod]);

    const getApiMessage = (message: unknown, fallback: string) => {
        if (typeof message === 'string' && message.trim()) return message;
        if (typeof message === 'object' && message !== null && 'user' in message) {
            const userMessage = (message as { user?: string }).user;
            if (typeof userMessage === 'string' && userMessage.trim()) return userMessage;
        }
        return fallback;
    };

    const refreshUser = async () => {
        const meResponse = await authService.me();
        const apiUser = meResponse?.data?.user;
        const token = localStorage.getItem('token');
        if (apiUser && token) {
            const walletS = Number(apiUser.walletS) || 0;
            const normalizedUser = {
                ...apiUser,
                id: apiUser._id || apiUser.id,
                walletS,
                balance: walletS,
                isVerified: apiUser.isVerified || false,
            };
            login(token, normalizedUser, false);
        }
    };

    const handleUpdateProfile = async () => {
        const name = personalForm.name.trim();
        const address = personalForm.address.trim();
        const phone = personalForm.phone.trim();
        const ageNumber = Number(personalForm.age);

        if (!user?.id) {
            setPersonalMessage({ type: 'error', text: 'User session not found. Please login again.' });
            return;
        }

        if (!name || !address || !phone || !personalForm.age.trim()) {
            setPersonalMessage({ type: 'error', text: 'Please fill name, address, phone, and age.' });
            return;
        }

        if (!Number.isFinite(ageNumber) || ageNumber <= 0) {
            setPersonalMessage({ type: 'error', text: 'Please enter a valid age.' });
            return;
        }

        setIsPersonalSaving(true);
        setPersonalMessage(null);

        try {
            const response = await authService.updateProfile(user.id, {
                name,
                address,
                phone,
                age: ageNumber,
            });

            if (response?.status === 200 || response?.status === 201) {
                await refreshUser();
                setPersonalMessage({ type: 'success', text: 'Profile updated successfully.' });
                return;
            }

            setPersonalMessage({
                type: 'error',
                text: getApiMessage(response?.message, 'Failed to update profile.'),
            });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string | { user?: string } } } };
            setPersonalMessage({
                type: 'error',
                text: getApiMessage(err?.response?.data?.message, 'Failed to update profile.'),
            });
        } finally {
            setIsPersonalSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        const currentPassword = passwordForm.currentPassword.trim();
        const newPassword = passwordForm.newPassword.trim();
        const confirmNewPassword = passwordForm.confirmNewPassword.trim();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: 'Please fill all password fields.' });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: 'New password and confirm password must match.' });
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordMessage({ type: 'error', text: 'New password must be different from current password.' });
            return;
        }

        setIsPasswordSaving(true);
        setPasswordMessage(null);

        try {
            const response = await authService.changePassword({
                oldPassword: currentPassword,
                newPassword,
            });

            if (response?.status === 200 || response?.status === 201) {
                setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                return;
            }

            setPasswordMessage({
                type: 'error',
                text: getApiMessage(response?.message, 'Failed to update password.'),
            });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string | { user?: string } } } };
            setPasswordMessage({
                type: 'error',
                text: getApiMessage(err?.response?.data?.message, 'Failed to update password.'),
            });
        } finally {
            setIsPasswordSaving(false);
        }
    };

    const handleSavePayoutDetails = async () => {
        if (!user?.id) {
            setPayoutMessage({ type: 'error', text: 'User session not found. Please login again.' });
            return;
        }

        setPayoutMessage(null);
        setIsPayoutSaving(true);

        try {
            let payload: Record<string, unknown> = {};

            if (payoutMethod === 'crypto') {
                if (!cryptoForm.walletAddress.trim()) {
                    setPayoutMessage({ type: 'error', text: 'Please enter your wallet address.' });
                    setIsPayoutSaving(false);
                    return;
                }
                payload = {
                    payOutCrypto: {
                        token: cryptoForm.tokenType || null,
                        address: cryptoForm.walletAddress.trim(),
                        memoTag: cryptoForm.memoTag.trim() || null,
                    },
                };
            } else {
                if (!bankForm.beneficiaryName.trim()) {
                    setPayoutMessage({ type: 'error', text: 'Please enter beneficiary name.' });
                    setIsPayoutSaving(false);
                    return;
                }
                if (!bankForm.bankName.trim()) {
                    setPayoutMessage({ type: 'error', text: 'Please enter bank name.' });
                    setIsPayoutSaving(false);
                    return;
                }
                if (!bankForm.accountNumber.trim()) {
                    setPayoutMessage({ type: 'error', text: 'Please enter account number.' });
                    setIsPayoutSaving(false);
                    return;
                }
                payload = {
                    payOutBank: {
                        beneficiaryName: bankForm.beneficiaryName.trim(),
                        bankName: bankForm.bankName.trim(),
                        accountNumber: bankForm.accountNumber.trim(),
                        iban: bankForm.iban.trim() || null,
                        accountType: bankForm.bankAccountType || null,
                        swiftCode: bankForm.swiftCode.trim() || null,
                        routingNumber: bankForm.routingNumber.trim() || null,
                    },
                };
            }

            const response = await authService.updateProfile(user.id, payload);

            if (response?.status === 200 || response?.status === 201) {
                await refreshUser();
                setPayoutMessage({ type: 'success', text: 'Payout details saved successfully.' });
                return;
            }

            setPayoutMessage({
                type: 'error',
                text: getApiMessage(response?.message, 'Failed to save payout details.'),
            });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string | { user?: string } } } };
            setPayoutMessage({
                type: 'error',
                text: getApiMessage(err?.response?.data?.message, 'Failed to save payout details.'),
            });
        } finally {
            setIsPayoutSaving(false);
        }
    };

    return (
        <div className="w-full h-full bg-[var(--bg-primary)] p-4 md:p-6 overflow-y-auto no-scrollbar">
            <div className="mb-8">
                <h1 className="text-2xl md:text-2xl font-orbitron font-bold text-white uppercase tracking-wider mb-1">
                    Account <span className="text-[var(--bg-yellow-primary)]">Settings</span>
                </h1>
                <p className="text-[var(--text-muted)] font-inter text-[12px]">
                    Manage your personal information and payout preferences.
                </p>
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm p-6 text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4 group text-white">
                                <div className="w-full h-full rounded-full bg-[var(--bg-navy-secondary)] flex items-center justify-center text-3xl font-bold border-2 border-[var(--bg-green-primary)]">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-[var(--bg-green-primary)] text-[var(--bg-navy-secondary)] rounded-full hover:scale-110 transition-transform shadow-lg">
                                    <Camera size={14} strokeWidth={3} />
                                </button>
                            </div>
                            <h2 className="text-xl font-orbitron font-bold text-white mb-1 uppercase tracking-tight">{user?.name || 'User'}</h2>
                            <p className="text-[var(--text-muted)] font-inter text-xs mb-4">{user?.email}</p>

                            <div className="flex flex-col gap-2">
                                {user?.isVerified ? (
                                    <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[var(--bg-green-primary)]/10 text-[var(--bg-green-primary)] rounded-sm border border-[var(--bg-green-primary)]/20 text-[10px] font-bold uppercase tracking-wider">
                                        <BadgeCheck size={14} />
                                        Verified Member
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-500/10 text-red-500 rounded-sm border border-red-500/20 text-[10px] font-bold uppercase tracking-wider">
                                        <ShieldAlert size={14} />
                                        Unverified Account
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-[var(--border-primary)] grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase mb-1 font-bold tracking-tighter">Member Since</p>
                                    <p className="text-white font-inter text-xs font-semibold">March 2026</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase mb-1 font-bold tracking-tighter">Account Level</p>
                                    <p className="text-[var(--bg-yellow-primary)] font-inter text-xs font-bold uppercase">{user?.accountType || 'Standard'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm overflow-hidden text-white">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-inter transition-all ${activeTab === 'personal' ? 'bg-[var(--bg-green-primary)]/10 text-[var(--bg-green-primary)] border-r-2 border-[var(--bg-green-primary)]' : 'hover:bg-white/5 text-[var(--text-muted)]'}`}
                            >
                                <User size={18} />
                                <span>Personal Information</span>
                                <ChevronRight size={16} className={`ml-auto opacity-30 ${activeTab === 'personal' ? 'rotate-90 text-[var(--bg-green-primary)] opacity-100' : ''}`} />
                            </button>
                            <button
                                onClick={() => setActiveTab('payout')}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-inter transition-all ${activeTab === 'payout' ? 'bg-[var(--bg-green-primary)]/10 text-[var(--bg-green-primary)] border-r-2 border-[var(--bg-green-primary)]' : 'hover:bg-white/5 text-[var(--text-muted)]'}`}
                            >
                                <Wallet size={18} />
                                <span>Payout Details</span>
                                <ChevronRight size={16} className={`ml-auto opacity-30 ${activeTab === 'payout' ? 'rotate-90 text-[var(--bg-green-primary)] opacity-100' : ''}`} />
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-inter transition-all ${activeTab === 'security' ? 'bg-[var(--bg-green-primary)]/10 text-[var(--bg-green-primary)] border-r-2 border-[var(--bg-green-primary)]' : 'hover:bg-white/5 text-[var(--text-muted)]'}`}
                            >
                                <Lock size={18} />
                                <span>Security & Password</span>
                                <ChevronRight size={16} className={`ml-auto opacity-30 ${activeTab === 'security' ? 'rotate-90 text-[var(--bg-green-primary)] opacity-100' : ''}`} />
                            </button>
                        </div>
                    </div>
                    <div className="lg:col-span-8">
                        {/* Personal Information Tab */}
                        {activeTab === 'personal' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm p-6 md:p-8">
                                    <h3 className="text-md font-orbitron font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1 h-6 bg-[var(--bg-yellow-primary)]"></div>
                                        Personal Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Full Name</label>
                                            <div className="relative opacity-60">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                <input
                                                    type="text"
                                                    value={personalForm.name}
                                                    disabled
                                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 text-white">
                                            <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Email Address</label>
                                            <div className="relative opacity-60">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                <input
                                                    type="email"
                                                    value={user?.email}
                                                    disabled
                                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Phone Number</label>
                                            <input
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                value={personalForm.phone}
                                                onChange={(e) => setPersonalForm((prev) => ({ ...prev, phone: e.target.value }))}
                                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-4 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Address</label>
                                            <input
                                                type="text"
                                                placeholder="Enter your address"
                                                value={personalForm.address}
                                                onChange={(e) => setPersonalForm((prev) => ({ ...prev, address: e.target.value }))}
                                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-4 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Age</label>
                                            <input
                                                type="number"
                                                placeholder="Enter your age"
                                                value={personalForm.age}
                                                onChange={(e) => setPersonalForm((prev) => ({ ...prev, age: e.target.value }))}
                                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-4 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Gender</label>
                                            <input
                                                type="text"
                                                value={user?.gender || 'Not set'}
                                                disabled
                                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-4 text-white font-inter text-sm cursor-not-allowed opacity-60"
                                            />
                                        </div>
                                    </div>

                                    {personalMessage && (
                                        <p
                                            className={`mt-4 text-[12px] font-inter font-medium whitespace-nowrap overflow-hidden text-ellipsis ${personalMessage.type === 'success' ? 'text-[var(--bg-green-primary)]' : 'text-red-400'
                                                }`}
                                        >
                                            {personalMessage.text}
                                        </p>
                                    )}

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={isPersonalSaving}
                                            className="flex items-center gap-2 bg-[var(--bg-green-primary)] hover:bg-[var(--bg-green-primary)]/90 text-[var(--bg-navy-secondary)] px-8 py-3 rounded-sm font-bold transition-all text-sm group cursor-pointer"
                                        >
                                            {isPersonalSaving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                                            <span>{isPersonalSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payout Details Tab */}
                        {activeTab === 'payout' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-6">
                                {/* Method Selector */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setPayoutMethod('crypto'); setPayoutMessage(null); }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm border text-sm font-bold transition-all ${payoutMethod === 'crypto'
                                                ? 'bg-[var(--bg-green-primary)]/10 border-[var(--bg-green-primary)] text-[var(--bg-green-primary)]'
                                                : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-muted)] hover:bg-white/5'
                                            }`}
                                    >
                                        <Bitcoin size={18} />
                                        Crypto Withdrawal
                                    </button>
                                    <button
                                        onClick={() => { setPayoutMethod('bank'); setPayoutMessage(null); }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm border text-sm font-bold transition-all ${payoutMethod === 'bank'
                                                ? 'bg-[var(--bg-yellow-primary)]/10 border-[var(--bg-yellow-primary)] text-[var(--bg-yellow-primary)]'
                                                : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-muted)] hover:bg-white/5'
                                            }`}
                                    >
                                        <Building2 size={18} />
                                        Bank Transfer (Local)
                                    </button>
                                </div>

                                {/* Crypto Withdrawal Form */}
                                {payoutMethod === 'crypto' && (
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm p-6 md:p-8">
                                        <h3 className="text-md font-orbitron font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-1 h-6 bg-[var(--bg-green-primary)]"></div>
                                            Crypto Withdrawal Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Token Type - Custom Searchable Dropdown */}
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Select Crypto Currency</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                                                        disabled={currenciesLoading}
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-4 text-white font-inter text-sm flex items-center justify-between focus:outline-none focus:border-[var(--bg-green-primary)] transition-all cursor-pointer disabled:opacity-50"
                                                    >
                                                        <span className={cryptoForm.tokenType ? 'text-white font-bold' : 'text-[var(--text-muted)]'}>
                                                            {currenciesLoading ? (
                                                                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading currencies...</span>
                                                            ) : cryptoForm.tokenType ? cryptoForm.tokenType.toUpperCase() : 'Choose a currency...'}
                                                        </span>
                                                        <Coins size={18} className="text-[var(--text-muted)]" />
                                                    </button>

                                                    {isTokenDropdownOpen && (
                                                        <div className="absolute top-full left-0 w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm shadow-lg z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <div className="p-2 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                                                                <div className="relative">
                                                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search currency..."
                                                                        value={tokenSearchTerm}
                                                                        onChange={(e) => setTokenSearchTerm(e.target.value)}
                                                                        autoFocus
                                                                        className="w-full h-[32px] pl-8 pr-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm text-[13px] text-white font-inter focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-[180px] overflow-y-auto no-scrollbar">
                                                                {filteredCurrencies.length > 0 ? (
                                                                    filteredCurrencies.map((curr) => (
                                                                        <button
                                                                            key={curr}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setCryptoForm({ ...cryptoForm, tokenType: curr });
                                                                                setIsTokenDropdownOpen(false);
                                                                                setTokenSearchTerm('');
                                                                            }}
                                                                            className={`w-full text-left px-4 py-2.5 hover:bg-[var(--bg-green-primary)]/10 text-[14px] font-inter transition-colors border-b border-[var(--border-primary)]/30 last:border-0 cursor-pointer ${cryptoForm.tokenType === curr ? 'bg-[var(--bg-green-primary)]/5 font-bold text-[var(--bg-green-primary)]' : 'text-white'}`}
                                                                        >
                                                                            {curr.toUpperCase()}
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-4 py-3 text-sm text-[var(--text-muted)] italic text-center">No matches found</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Wallet Address */}
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{(cryptoForm.tokenType || 'Crypto').toUpperCase()} Wallet Address</label>
                                                <div className="relative">
                                                    <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F7931A]" size={18} />
                                                    <input
                                                        type="text"
                                                        placeholder={`Enter your ${(cryptoForm.tokenType || 'crypto').toUpperCase()} address`}
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all font-mono"
                                                        value={cryptoForm.walletAddress}
                                                        onChange={(e) => setCryptoForm({ ...cryptoForm, walletAddress: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Memo Tag */}
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    Memo Tag / Destination Tag
                                                    <span className="text-[var(--bg-yellow-primary)] text-[9px] normal-case">(if required)</span>
                                                </label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder={`Enter memo tag for ${(cryptoForm.tokenType || 'crypto').toUpperCase()}`}
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all font-mono"
                                                        value={cryptoForm.memoTag}
                                                        onChange={(e) => setCryptoForm({ ...cryptoForm, memoTag: e.target.value })}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-[var(--bg-yellow-primary)] font-inter flex items-center gap-1">
                                                    <AlertCircle size={10} />
                                                    Some tokens (XRP, XLM, BNB, EOS) require a memo tag. Funds may be lost without it.
                                                </p>
                                            </div>
                                        </div>

                                        {payoutMessage && (
                                            <p className={`mt-4 text-[12px] font-inter font-medium ${payoutMessage.type === 'success' ? 'text-[var(--bg-green-primary)]' : 'text-red-400'}`}>
                                                {payoutMessage.text}
                                            </p>
                                        )}

                                        <div className="mt-8 flex justify-end">
                                            <button
                                                onClick={handleSavePayoutDetails}
                                                disabled={isPayoutSaving}
                                                className="flex items-center gap-2 bg-[var(--bg-green-primary)] hover:bg-[var(--bg-green-primary)]/90 text-[var(--bg-navy-secondary)] px-8 py-3 rounded-sm font-bold transition-all text-sm group cursor-pointer"
                                            >
                                                {isPayoutSaving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                                                <span>{isPayoutSaving ? 'Saving...' : 'Save Details'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Bank Transfer Form */}
                                {payoutMethod === 'bank' && (
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm p-6 md:p-8">
                                        <h3 className="text-md font-orbitron font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-1 h-6 bg-[var(--bg-yellow-primary)]"></div>
                                            Bank Transfer Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Beneficiary Name */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Beneficiary Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Full name on the bank account"
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                                        value={bankForm.beneficiaryName}
                                                        onChange={(e) => setBankForm({ ...bankForm, beneficiaryName: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Bank Name */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Bank Name</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Chase Bank, HSBC"
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                                        value={bankForm.bankName}
                                                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Account Number */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Account Number</label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Enter account number"
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all font-mono"
                                                        value={bankForm.accountNumber}
                                                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* IBAN */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    IBAN
                                                    <span className="text-[var(--bg-yellow-primary)] text-[9px] normal-case">(if applicable)</span>
                                                </label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="International Bank Account Number"
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all font-mono"
                                                        value={bankForm.iban}
                                                        onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Bank Account Type */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Bank Account Type</label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                    <select
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-10 text-white font-inter text-sm appearance-none focus:outline-none focus:border-[var(--bg-green-primary)] transition-all cursor-pointer"
                                                        value={bankForm.bankAccountType}
                                                        onChange={(e) => setBankForm({ ...bankForm, bankAccountType: e.target.value })}
                                                    >
                                                        <option value="">Select account type</option>
                                                        <option value="checking">Checking</option>
                                                        <option value="current">Current</option>
                                                        <option value="savings">Savings</option>
                                                        <option value="money_market">Money Market</option>
                                                        <option value="fixed_deposit">Fixed Deposit</option>
                                                        <option value="certificate_of_deposit">Certificate of Deposit</option>
                                                        <option value="high_yield_savings">High Yield Savings</option>
                                                        <option value="business">Business</option>
                                                        <option value="student">Student</option>
                                                        <option value="joint">Joint</option>
                                                        <option value="foreign_currency">Foreign Currency</option>
                                                        <option value="basic">Basic</option>
                                                        <option value="isa">ISA</option>
                                                        <option value="retirement_ira">Retirement IRA</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                                                </div>
                                            </div>

                                            {/* Swift Code */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    SWIFT / BIC Code
                                                    <span className="text-[var(--bg-yellow-primary)] text-[9px] normal-case">(if applicable)</span>
                                                </label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. CHASUS33"
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all font-mono"
                                                        value={bankForm.swiftCode}
                                                        onChange={(e) => setBankForm({ ...bankForm, swiftCode: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Routing Number */}
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    Routing Number
                                                    <span className="text-[var(--bg-yellow-primary)] text-[9px] normal-case">(if applicable)</span>
                                                </label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 021000021"
                                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-10 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all font-mono"
                                                        value={bankForm.routingNumber}
                                                        onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {payoutMessage && (
                                            <p className={`mt-4 text-[12px] font-inter font-medium ${payoutMessage.type === 'success' ? 'text-[var(--bg-green-primary)]' : 'text-red-400'}`}>
                                                {payoutMessage.text}
                                            </p>
                                        )}

                                        <div className="mt-8 flex justify-end">
                                            <button
                                                onClick={handleSavePayoutDetails}
                                                disabled={isPayoutSaving}
                                                className="flex items-center gap-2 bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-primary)]/90 text-[var(--bg-navy-secondary)] px-8 py-3 rounded-sm font-bold transition-all text-sm group cursor-pointer"
                                            >
                                                {isPayoutSaving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                                                <span>{isPayoutSaving ? 'Saving...' : 'Save Details'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm p-6 md:p-8">
                                    <h3 className="text-md font-orbitron font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1 h-6 bg-red-500"></div>
                                        Security Settings
                                    </h3>

                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Current Password</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••••••"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-4 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-4 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.confirmNewPassword}
                                                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))}
                                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm py-3 px-4 text-white font-inter text-sm focus:outline-none focus:border-[var(--bg-green-primary)] transition-all"
                                                />
                                            </div>
                                        </div>

                                        {passwordMessage && (
                                            <p
                                                className={`text-[12px] font-inter font-medium whitespace-nowrap overflow-hidden text-ellipsis ${passwordMessage.type === 'success' ? 'text-[var(--bg-green-primary)]' : 'text-red-400'
                                                    }`}
                                            >
                                                {passwordMessage.text}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            onClick={handleUpdatePassword}
                                            disabled={isPasswordSaving}
                                            className="flex items-center gap-2 bg-white text-[var(--bg-navy-secondary)] px-8 py-3 rounded-sm font-bold transition-all text-sm cursor-pointer"
                                        >
                                            {isPasswordSaving ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
