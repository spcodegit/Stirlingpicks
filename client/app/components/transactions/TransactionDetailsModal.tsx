'use client';
import React, { useState } from 'react';
import { X, FileText, Loader2, Copy, Check } from 'lucide-react';

interface TransactionDetails {
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
}

interface TransactionDetailsModalProps {
    open: boolean;
    loading: boolean;
    transaction: TransactionDetails | null;
    onClose: () => void;
}

export default function TransactionDetailsModal({
    open,
    loading,
    transaction,
    onClose,
}: TransactionDetailsModalProps) {
    const [copiedField, setCopiedField] = useState('');

    if (!open || !transaction) return null;

    const hasPaymentDetails = Boolean(transaction.payAddress && transaction.payAmount && transaction.payCurrency);
    const paymentStatus = (transaction.rawStatus || transaction.status || 'waiting').toUpperCase();

    const handleCopy = (text: string, fieldName: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(''), 1500);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-[440px] bg-[var(--bg-white)] shadow-2xl rounded-sm overflow-hidden border border-[var(--border-light)] animate-in fade-in zoom-in duration-300">
                <div className="relative h-[56px] bg-[var(--bg-green-header)] flex items-center px-4">
                    <div
                        className="absolute inset-0 opacity-[0.1]"
                        style={{
                            backgroundImage: `linear-gradient(45deg, var(--bg-green-header) 25%, transparent 25%, transparent 50%, var(--bg-green-header) 50%, var(--bg-green-header) 75%, transparent 75%, transparent)`,
                            backgroundSize: '4px 4px'
                        }}
                    ></div>

                    <div className="relative flex items-center gap-2.5 z-10">
                        <FileText size={18} className="text-[var(--bg-navy-secondary)]" />
                        <span className="text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] tracking-wide uppercase">
                            Transaction Details
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="relative ml-auto p-1 text-[var(--bg-navy-secondary)]/70 hover:text-[var(--bg-navy-secondary)] transition-all z-20 cursor-pointer"
                        type="button"
                    >
                        <X size={24} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="p-6 space-y-3 bg-[var(--bg-white)] max-h-[calc(100vh-180px)] overflow-y-auto no-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 text-[var(--text-dark-secondary)] py-8">
                            <Loader2 size={16} className="animate-spin" />
                            Loading details...
                        </div>
                    ) : (
                        <>
                            {hasPaymentDetails && (
                                <div className="relative bg-gray-50/50 rounded-lg p-3 sm:p-4 border border-gray-100 space-y-4">
                                    <div className="text-center space-y-0.5">
                                        <h3 className="text-[15px] font-black text-[var(--bg-navy-secondary)] uppercase tracking-tight">
                                            Payment Details
                                        </h3>
                                        <p className="text-[12px] text-[var(--text-dark-secondary)] font-medium">
                                            Send exactly <span className="text-[var(--bg-navy-secondary)] font-bold">{transaction.payAmount} {transaction.payCurrency}</span>.
                                        </p>
                                        <p className="text-[11px] text-[var(--text-dark-secondary)] font-semibold">
                                            Payment status: <span className="uppercase">{paymentStatus}</span>
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="p-2.5 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(transaction.payAddress || '')}`}
                                                alt="Payment QR Code"
                                                className="w-[110px] h-[110px]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="bg-white border border-gray-100 rounded p-3">
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Deposit Address</p>
                                            <div className="mt-1 flex items-start gap-2">
                                                <p className="text-[12px] font-bold text-[var(--text-dark)] break-all flex-1">{transaction.payAddress}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(transaction.payAddress || '', 'address')}
                                                    className="w-7 h-7 shrink-0 rounded-md border border-gray-200 text-gray-500 hover:text-[var(--bg-navy-secondary)] hover:border-[var(--bg-navy-secondary)]/30 flex items-center justify-center transition-all"
                                                    aria-label="Copy deposit address"
                                                >
                                                    {copiedField === 'address' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </div>

                                        {transaction.payinExtraId && (
                                            <div className="bg-white border border-gray-100 rounded p-3">
                                                <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Memo / Tag</p>
                                                <div className="mt-1 flex items-start gap-2">
                                                    <p className="text-[12px] font-bold text-[var(--text-dark)] break-all flex-1">{transaction.payinExtraId}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(transaction.payinExtraId || '', 'memo')}
                                                        className="w-7 h-7 shrink-0 rounded-md border border-gray-200 text-gray-500 hover:text-[var(--bg-navy-secondary)] hover:border-[var(--bg-navy-secondary)]/30 flex items-center justify-center transition-all"
                                                        aria-label="Copy memo tag"
                                                    >
                                                        {copiedField === 'memo' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white border border-gray-100 rounded p-3">
                                                <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Pay Amount</p>
                                                <p className="text-[13px] font-bold text-[var(--text-dark)]">
                                                    {transaction.payAmount} {transaction.payCurrency}
                                                </p>
                                            </div>
                                            <div className="bg-white border border-gray-100 rounded p-3">
                                                <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">USD Value</p>
                                                <p className="text-[13px] font-bold text-[var(--text-dark)]">${(transaction.priceAmount || transaction.amount || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Transaction ID</p>
                                <p className="text-[13px] font-bold text-[var(--text-dark)] break-all">{transaction.id}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Date</p>
                                    <p className="text-[12px] font-semibold text-[var(--text-dark)]">{transaction.date}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Status</p>
                                    <p className="text-[12px] font-semibold text-[var(--text-dark)] uppercase">{transaction.status}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Type</p>
                                    <p className="text-[12px] font-semibold text-[var(--text-dark)]">{transaction.type}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Account</p>
                                    <p className="text-[12px] font-semibold text-[var(--text-dark)] uppercase">{transaction.accountType || '-'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Method</p>
                                    <p className="text-[12px] font-semibold text-[var(--text-dark)]">{transaction.method}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Amount</p>
                                    <p className="text-[13px] font-bold text-[var(--text-dark)]">${Math.abs(transaction.amount).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Details</p>
                                <p className="text-[12px] text-[var(--text-dark)] leading-relaxed">{transaction.details}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
