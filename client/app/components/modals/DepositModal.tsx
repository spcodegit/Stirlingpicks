'use client';
import React, { useState, useEffect } from 'react';
import { X, Wallet, ChevronRight, Loader2, Coins, ArrowLeft, Search, Check, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService, nowPaymentService, CreatePaymentRequest, CreatePaymentResultData } from '../../services/authService';
import Image from "next/image";
import logo from "@/public/images/logo-2.png";

const DEPOSIT_SYNC_KEY = 'pending_nowpayment_sync';

interface PendingPaymentSync {
    paymentId: string;
    orderId: string;
    payAmount: number;
    priceAmount: number;
    lastSyncedStatus: string;
}

export default function DepositModal() {
    const { isDepositModalOpen, closeDepositModal, depositConfig, user, login } = useAuth();
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [currencies, setCurrencies] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCurrencies, setFetchingCurrencies] = useState(false);
    const [error, setError] = useState('');
    const [paymentResult, setPaymentResult] = useState<CreatePaymentResultData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [copiedField, setCopiedField] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const readPendingSync = (): PendingPaymentSync | null => {
        try {
            const raw = localStorage.getItem(DEPOSIT_SYNC_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as PendingPaymentSync;
            if (!parsed?.paymentId || !parsed?.orderId) return null;
            return parsed;
        } catch {
            return null;
        }
    };

    const writePendingSync = (pending: PendingPaymentSync) => {
        localStorage.setItem(DEPOSIT_SYNC_KEY, JSON.stringify(pending));
    };

    const clearPendingSync = () => {
        localStorage.removeItem(DEPOSIT_SYNC_KEY);
    };

    const filteredCurrencies = currencies.filter((curr: string) =>
        curr.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (isDepositModalOpen) {
            if (depositConfig) {
                // Pre-configured for professional plan purchase
                setAmount(String(depositConfig.amount));
                setStep(1); // will auto-advance after currencies load
                setSelectedCurrency('');
                setError('');
                setPaymentResult(null);
                setPaymentStatus('');
                setIsCheckingStatus(false);
                // Auto-fetch currencies and go to step 2
                const autoFetchCurrencies = async () => {
                    setFetchingCurrencies(true);
                    try {
                        const data = await nowPaymentService.selectedCurrencies();
                        if (data.status === 200 || data.status === 201) {
                            const currencyList = data.data?.selectedCurrencies || [];
                            setCurrencies(Array.isArray(currencyList) ? currencyList : []);
                            setStep(2);
                        }
                    } catch (err) {
                        console.error('Error fetching currencies:', err);
                    } finally {
                        setFetchingCurrencies(false);
                    }
                };
                autoFetchCurrencies();
            } else {
                setStep(1);
                setAmount('');
                setSelectedCurrency('');
                setError('');
                setPaymentResult(null);
                setPaymentStatus('');
                setIsCheckingStatus(false);
            }
        }
    }, [isDepositModalOpen, depositConfig]);

    // Runs once on page load to sync any pending payment stored in localStorage.
    // Does NOT poll or re-run on state changes — only executes on hard page reload.
    useEffect(() => {
        let isActive = true;

        const syncOnPageLoad = async () => {
            const pending = readPendingSync();
            if (!pending?.paymentId || !pending?.orderId) return;

            try {
                const response = await nowPaymentService.paymentStatus(pending.paymentId);
                const paymentData = response.data;
                if (!isActive) return;

                const normalizedPayload = {
                    actually_paid: Number(paymentData?.pay_amount ?? pending.payAmount ?? 0),
                    order_id: String(paymentData?.order_id || pending.orderId),
                    pay_amount: Number(paymentData?.pay_amount ?? pending.payAmount ?? 0),
                    payment_status: "finished",
                    price_amount: Number(paymentData?.price_amount ?? pending.priceAmount ?? 0),
                    skip: true,
                };

                if (normalizedPayload.payment_status !== pending.lastSyncedStatus) {
                    await nowPaymentService.webhook(normalizedPayload);

                    writePendingSync({
                        paymentId: pending.paymentId,
                        orderId: normalizedPayload.order_id,
                        payAmount: normalizedPayload.pay_amount,
                        priceAmount: normalizedPayload.price_amount,
                        lastSyncedStatus: normalizedPayload.payment_status,
                    });
                }

                if (normalizedPayload.payment_status === 'finished') {
                    const meResponse = await authService.me();
                    const apiUser = meResponse?.data?.user;
                    const token = localStorage.getItem('token');
                    if (apiUser && token && isActive) {
                        const walletS = Number(apiUser.walletS) || 0;
                        login(token, {
                            ...apiUser,
                            id: apiUser._id || apiUser.id,
                            walletS,
                            balance: walletS,
                            isVerified: apiUser.isVerified || false,
                        }, false);
                    }
                    clearPendingSync();
                }
            } catch (_err) {
                // Silently fail on transient errors.
            }
        };

        syncOnPageLoad();

        return () => {
            isActive = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNextStep = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        setError('');
        setFetchingCurrencies(true);
        try {
            const data = await nowPaymentService.selectedCurrencies();
            if (data.status === 200 || data.status === 201) {
                // The backend returns { selectedCurrencies: [...] }
                const currencyList = data.data?.selectedCurrencies || [];
                setCurrencies(Array.isArray(currencyList) ? currencyList : []);
                setStep(2);
            } else {
                const msg = data.message;
                const errorString = typeof msg === 'object' ? (msg.user || msg.system || "Server Error") : (msg || 'Failed to fetch currencies');
                setError(errorString);
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string | { user?: string; system?: string } } }; message?: string };
            const serverMsg = axiosErr.response?.data?.message;
            const errorString = typeof serverMsg === 'object' ? (serverMsg.user || serverMsg.system || "Server Error") : (serverMsg || axiosErr.message || 'Error fetching currencies. Please try again.');
            setError(errorString);
            console.error('Error fetching currencies:', err);
        } finally {
            setFetchingCurrencies(false);
        }
    };



    const handleCopy = (text: string, fieldName: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(''), 2000);
    };





    const handleCreatePayment = async () => {
        if (!selectedCurrency) {
            setError('Please select a currency');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const paymentPayload: CreatePaymentRequest = {
                amount: parseFloat(amount),
                currency: selectedCurrency,
                accountType: depositConfig?.accountType || 'standard',
                paymentMethod: 'crypto'
            };
            if (depositConfig?.planId) {
                paymentPayload.planId = depositConfig.planId;
            }
            const result = await nowPaymentService.createPayment(paymentPayload);

            if (result.status === 200 || result.status === 201) {
                setPaymentResult(result.data);
                const paymentInfo = result.data.paymentInfo;
                const paymentId = paymentInfo.payment_id;
                const orderId = result.data.customOrderId || paymentInfo.order_id;
                if (paymentId && orderId) {
                    writePendingSync({
                        paymentId,
                        orderId,
                        payAmount: Number(paymentInfo.pay_amount || 0),
                        priceAmount: Number(paymentInfo.price_amount || parseFloat(amount) || 0),
                        lastSyncedStatus: '',
                    });
                }
                setStep(3);
            } else {
                const msg = result.message;
                const errorString = typeof msg === 'object' ? (msg.user || msg.system || "Server Error") : (msg || 'Failed to create payment');
                setError(errorString);
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string | { user?: string; system?: string } } }; message?: string };
            const serverMsg = axiosErr.response?.data?.message;
            const errorString = typeof serverMsg === 'object' ? (serverMsg.user || serverMsg.system || "Server Error") : (serverMsg || axiosErr.message || 'Error creating payment. Please try again.');
            setError(errorString);
            console.error('Error creating payment:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isDepositModalOpen) return null;

    const payAddress = paymentResult?.paymentInfo?.pay_address || '';
    const payAmount = paymentResult?.paymentInfo?.pay_amount || '';
    const payCurrency = paymentResult?.paymentInfo?.pay_currency || '';
    const payinExtraId = paymentResult?.paymentInfo?.payin_extra_id || '';
    const priceAmount = String(paymentResult?.paymentInfo?.price_amount || paymentResult?.amount || '');

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeDepositModal}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[440px] bg-[var(--bg-white)] shadow-2xl rounded-sm overflow-hidden border border-[var(--border-light)] animate-in fade-in zoom-in duration-300">
                {/* Header Bar */}
                <div className="relative h-[56px] bg-[var(--bg-green-header)] flex items-center px-4">
                    <div
                        className="absolute inset-0 opacity-[0.1]"
                        style={{
                            backgroundImage: `linear-gradient(45deg, var(--bg-green-header) 25%, transparent 25%, transparent 50%, var(--bg-green-header) 50%, var(--bg-green-header) 75%, transparent 75%, transparent)`,
                            backgroundSize: '4px 4px'
                        }}
                    ></div>

                    <div className="relative flex items-center gap-2.5 z-10">
                        {step > 1 && step < 3 && (
                            <button onClick={() => setStep(step - 1)} className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer mr-1">
                                <ArrowLeft size={18} className="text-[var(--bg-navy-secondary)]" />
                            </button>
                        )}
                        <Wallet size={18} className="text-[var(--bg-navy-secondary)]" />
                        <span className="text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] tracking-wide uppercase">
                            {step === 3 ? 'Payment Details' : depositConfig ? 'Buy Plan' : 'Deposit Funds'}
                        </span>
                    </div>

                    <button
                        onClick={closeDepositModal}
                        className="relative ml-auto p-1 text-[var(--bg-navy-secondary)]/70 hover:text-[var(--bg-navy-secondary)] transition-all z-20 cursor-pointer"
                    >
                        <X size={26} strokeWidth={1.5} />
                    </button>
                    <div className="absolute right-[65px] top-0 bottom-0 w-[1px] bg-[var(--bg-navy-secondary)]/20 -skew-x-[25deg]"></div>
                </div>

                {/* Brand Section */}
                <div className="bg-[var(--bg-green-primary)] py-4 px-6 sm:px-8 flex items-center justify-between border-b border-[var(--border-light)]">
                    <div className="flex items-center select-none">
                        <Image
                            src={logo}
                            alt="Stirling Picks"
                            className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] object-contain bg-white rounded-full"
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-[var(--text-white)] font-inter text-[12px] opacity-80">Step {step} of 3</p>
                        <p className="text-[var(--text-white)] font-inter font-bold text-[14px]">
                            {step === 1 ? 'Enter Amount' : step === 2 ? 'Select Currency' : 'Complete Payment'}
                        </p>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-7 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-[var(--text-dark-secondary)] uppercase tracking-wider">Amount (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dark-secondary)] font-bold">$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full h-[48px] pl-8 pr-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[17px] font-bold focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleNextStep}
                                disabled={fetchingCurrencies || !amount}
                                className="w-full h-[52px] bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)] text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] rounded-[3px] transition-all active:scale-[0.985] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {fetchingCurrencies ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Next <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-[var(--text-dark-secondary)] uppercase tracking-wider">Select Crypto Currency</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full h-[48px] px-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[15px] flex items-center justify-between focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all cursor-pointer"
                                    >
                                        <span className={selectedCurrency ? "text-[var(--text-dark)] font-bold" : "text-[var(--text-gray-placeholder)]"}>
                                            {selectedCurrency ? selectedCurrency.toUpperCase() : "Choose a currency..."}
                                        </span>
                                        <Coins size={18} className="text-[var(--text-dark-secondary)]" />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] shadow-lg z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                            {/* Search Input */}
                                            <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search currency..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        autoFocus
                                                        className="w-full h-[32px] pl-8 pr-3 bg-white border border-gray-200 rounded-[2px] text-[13px] focus:outline-none focus:border-[var(--bg-yellow-primary)] transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Scrollable List */}
                                            <div className="max-h-[180px] overflow-y-auto no-scrollbar">
                                                {filteredCurrencies.length > 0 ? (
                                                    filteredCurrencies.map((curr) => (
                                                        <button
                                                            key={curr}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCurrency(curr);
                                                                setIsDropdownOpen(false);
                                                                setSearchTerm('');
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 hover:bg-[var(--bg-yellow-primary)]/10 text-[14px] font-inter transition-colors border-b border-gray-50 last:border-0 ${selectedCurrency === curr ? 'bg-[var(--bg-yellow-primary)]/5 font-bold text-[var(--bg-navy-secondary)]' : 'text-[var(--text-dark)]'}`}
                                                        >
                                                            {curr.toUpperCase()}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500 italic text-center">No matches found</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-[var(--text-dark-secondary)]">Deposit Amount:</span>
                                    <span className="font-bold text-[var(--text-dark)]">${parseFloat(amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--text-dark-secondary)]">Payment Currency:</span>
                                    <span className="font-bold text-[var(--text-dark)]">{selectedCurrency.toUpperCase() || '---'}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCreatePayment}
                                disabled={loading || !selectedCurrency}
                                className="w-full h-[52px] bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)] text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] rounded-[3px] transition-all active:scale-[0.985] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Pay Now"}
                            </button>
                        </div>
                    )}

                    {step === 3 && paymentResult && (
                        <div className="space-y-3.5">
                            {/* Header Section */}
                            <div className="text-center space-y-0.5">
                                <h3 className="text-[16px] font-black text-[var(--bg-navy-secondary)] uppercase tracking-tight">
                                    Deposit Details
                                </h3>
                                <p className="text-[12px] text-[var(--text-dark-secondary)] font-medium">
                                    Send exactly <span className="text-[var(--bg-navy-secondary)] font-bold">{payAmount} {payCurrency?.toUpperCase()}</span>.
                                </p>
                                <p className="text-[11px] text-[var(--text-dark-secondary)] font-semibold">
                                    Payment status: <span className="uppercase">{paymentStatus || 'waiting'}</span>{isCheckingStatus ? ' (checking...)' : ''}
                                </p>
                            </div>
                            <div className="relative bg-gray-50/50 rounded-lg p-3 sm:p-4 border border-gray-100 space-y-4">
                                {payinExtraId && (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-md px-3 py-2 text-[11px] font-semibold leading-relaxed">
                                        Important: You must include the Memo/Tag below when sending this payment to complete your deposit.
                                    </div>
                                )}
                                <div className="flex justify-center">
                                    <div className="p-2.5 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 transition-transform hover:scale-[1.02]">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(payAddress)}`}
                                            alt="Payment QR Code"
                                            className="w-[110px] h-[110px]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center px-0.5">
                                            <label className="text-[10px] font-black text-[var(--text-dark-secondary)] uppercase tracking-widest">Deposit Address</label>
                                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.2 rounded uppercase">Verified</span>
                                        </div>
                                        <div
                                            onClick={() => handleCopy(payAddress, 'address')}
                                            className="relative group cursor-pointer"
                                        >
                                            <div className="w-full bg-white border border-gray-200 rounded-lg p-3 pr-10 transition-all hover:border-[var(--bg-navy-secondary)]/30">
                                                <p className="text-[11px] font-mono break-all font-bold text-[var(--bg-navy-secondary)] leading-relaxed">
                                                    {payAddress}
                                                </p>
                                            </div>
                                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-md bg-white border border-gray-100 text-gray-400 group-hover:text-[var(--bg-navy-secondary)] transition-all">
                                                {copiedField === 'address' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                            </div>
                                            {copiedField === 'address' && (
                                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--bg-navy-secondary)] text-white text-[9px] font-bold rounded animate-in fade-in slide-in-from-bottom-1 z-10">
                                                    Copied!
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {payinExtraId && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center px-0.5">
                                                <label className="text-[10px] font-black text-[var(--text-dark-secondary)] uppercase tracking-widest">Memo/Tag</label>
                                                <span className="text-[9px] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.2 rounded uppercase">Required</span>
                                            </div>
                                            <div
                                                onClick={() => handleCopy(payinExtraId, 'memo')}
                                                className="relative group cursor-pointer"
                                            >
                                                <div className="w-full bg-white border border-gray-200 rounded-lg p-3 pr-10 transition-all hover:border-[var(--bg-navy-secondary)]/30">
                                                    <p className="text-[11px] font-mono break-all font-bold text-[var(--bg-navy-secondary)] leading-relaxed">
                                                        {payinExtraId}
                                                    </p>
                                                </div>
                                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-md bg-white border border-gray-100 text-gray-400 group-hover:text-[var(--bg-navy-secondary)] transition-all">
                                                    {copiedField === 'memo' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                                </div>
                                                {copiedField === 'memo' && (
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--bg-navy-secondary)] text-white text-[9px] font-bold rounded animate-in fade-in slide-in-from-bottom-1 z-10">
                                                        Copied!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Amount & Price Row */}
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="bg-white p-2.5 border border-gray-100 rounded-lg">
                                            <label className="text-[8px] font-black text-[var(--text-dark-secondary)] uppercase tracking-[0.1em]">Pay Amount</label>
                                            <p className="text-[13px] font-black text-[var(--bg-navy-secondary)]">
                                                {payAmount} <span className="text-[10px] opacity-60 font-bold">{payCurrency?.toUpperCase()}</span>
                                            </p>
                                        </div>
                                        <div className="bg-white p-2.5 border border-gray-100 rounded-lg">
                                            <label className="text-[8px] font-black text-[var(--text-dark-secondary)] uppercase tracking-[0.1em]">USD Value</label>
                                            <p className="text-[13px] font-black text-[var(--bg-navy-secondary)]">
                                                ${parseFloat(priceAmount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={closeDepositModal}
                                className="w-full h-[48px] bg-[var(--bg-navy-secondary)] hover:bg-[var(--bg-navy-secondary)]/95 text-white font-inter font-bold text-[14px] uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
