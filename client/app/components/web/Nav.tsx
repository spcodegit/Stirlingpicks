"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, DollarSign, PoundSterling, Euro, Banknote, Loader2, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { ACCOUNT_TYPES } from "../../context/constants";
import axios from "axios";
import { API_ROUTES } from "../../services/apiRoutes";

const navLinks = [
    {
        href: "/",
        label: "Home",
    },
    {
        href: "/how-it-works",
        label: "How it works",
    },
    {
        href: "/promotions",
        label: "Promotions",
    },
    {
        href: "/account",
        label: "Account",
    },
];

const currencies = [
    { code: "USD", symbol: "$", label: "US Dollar", icon: DollarSign },
    { code: "GBP", symbol: "£", label: "British Pound", icon: PoundSterling },
    { code: "EUR", symbol: "€", label: "Euro", icon: Euro },
    { code: "NGN", symbol: "₦", label: "Nigerian Naira", icon: Banknote },
];



const WalletPlusIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`inline-block ${className}`}
    >
        {/* Top card/line */}
        <path d="M6 5.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1V6H6v-.5z" />
        {/* Main Wallet body */}
        <path d="M5 8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V17a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17V8.5z" />
        {/* Flap on the right */}
        <path d="M17 11.5a1.5 1.5 0 0 1 1.5-1.5h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1.5 1.5 0 0 1-1.5-1.5v-1z" fill="currentColor" />
        {/* Clasp center dot/line */}
        <path d="M19 12.5h1" stroke="var(--bg-green-primary)" strokeWidth="1" strokeLinecap="round" />
        {/* Plus Circle at bottom-left */}
        <circle cx="6.5" cy="17.5" r="4.5" fill="currentColor" stroke="var(--bg-green-primary)" strokeWidth="1" />
        <path d="M6.5 15.5v4M4.5 17.5h4" stroke="var(--bg-green-primary)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

export default function Nav() {
    const { user, updateUser, login } = useAuth();
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [conversionRate, setConversionRate] = useState(1);
    const [isConverting, setIsConverting] = useState(false);
    const [isChangingAccount, setIsChangingAccount] = useState(false);

    const currentAccountType = user?.accountType || 'standard';
    const walletAmount = currentAccountType === 'professional'
        ? Number(user?.walletP ?? 0)
        : Number(user?.walletS ?? user?.balance ?? 0);

    const convertedWalletAmount = Number.isFinite(walletAmount * conversionRate) ? walletAmount * conversionRate : 0;

    const SelectedIcon = selectedCurrency.icon;

    useEffect(() => {
        let isCancelled = false;

        const fetchRate = async () => {
            const targetCode = selectedCurrency.code.toLowerCase();

            if (targetCode === "usd") {
                setConversionRate(1);
                setIsConverting(false);
                return;
            }

            setIsConverting(true);
            try {
                const response = await axios.get(API_ROUTES.CURRENCY.FALLBACK_LATEST);
                const rate = Number(response.data.usd[targetCode]);

                if (!Number.isFinite(rate) || rate <= 0) {
                    throw new Error("Invalid conversion rate");
                }

                if (!isCancelled) {
                    setConversionRate(rate);
                }
            } catch (error) {
                console.error("Conversion error:", error);
                if (!isCancelled) {
                    setConversionRate(1);
                }
            } finally {
                if (!isCancelled) {
                    setIsConverting(false);
                }
            }
        };

        fetchRate();

        return () => {
            isCancelled = true;
        };
    }, [selectedCurrency.code]);

    const handleAccountChange = async (type: 'standard' | 'professional') => {
        if (type === currentAccountType || isChangingAccount) return;

        setIsChangingAccount(true);
        try {
            await authService.changeAccountType(type);

            // Re-fetch user from backend to get correct balance for new account type
            const meResponse = await authService.me();
            const apiUser = meResponse?.data?.user;
            if (apiUser) {
                const token = localStorage.getItem('token');
                const walletS = Number(apiUser.walletS) || 0;
                const walletPVal = Number(apiUser.walletP) || 0;
                const acctType = apiUser.accountType || 'standard';
                const normalizedUser = {
                    ...apiUser,
                    id: apiUser._id || apiUser.id,
                    walletS,
                    walletP: walletPVal,
                    balance: acctType === 'professional' ? walletPVal : walletS,
                    isVerified: apiUser.isVerified || false,
                };
                if (token) {
                    login(token, normalizedUser, false);
                } else {
                    updateUser(normalizedUser);
                }
            } else {
                updateUser({ accountType: type });
            }

            setIsAccountDropdownOpen(false);
        } catch (error) {
            console.error("Failed to change account type:", error);
        } finally {
            setIsChangingAccount(false);
        }
    };

    return (
        <nav
            className="w-full h-auto min-h-[48px] py-2 lg:py-0 px-4 md:px-6 bg-[var(--bg-green-primary)] flex items-center"
        >
            <div className="w-full max-w-[1156px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">

                {/* Left Navigation Links - Scrollable on mobile */}
                <div className="font-orbitron flex items-center gap-2 md:gap-4 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0 justify-start">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                                whitespace-nowrap
                                h-[29px]
                                text-[var(--text-black)] font-bold text-[14px]
                                px-3 md:px-4 py-1.5
                                rounded-[10px]
                                transition-all duration-300
                                hover:bg-[var(--text-primary)]/30
                                hover:backdrop-blur-md border border-transparent hover:border-[var(--bg-yellow-primary)]
                                font-orbitron
                            `}
                            style={{
                                lineHeight: "100%",
                                textAlign: "center",
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full lg:w-auto justify-start sm:justify-center lg:justify-end pb-1 lg:pb-0">
                    {/* Top Up */}
                    <Link
                        href="/account"
                        className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 bg-[var(--bg-white)] rounded-full hover:bg-gray-50 transition-colors cursor-pointer group font-inter font-bold text-[12px] md:text-[14px] text-[var(--text-black)] whitespace-nowrap"
                    >
                        <div className="flex items-center justify-center p-0.5 bg-[var(--bg-green-primary)] rounded-full text-[var(--text-black)]">
                            <WalletPlusIcon size={18} className="text-[var(--text-black)]" />
                        </div>
                        <span>Top up</span>
                    </Link>

                    {/* Account Type Selector (User) */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                                disabled={isChangingAccount}
                                className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 bg-[var(--bg-white)] rounded-full hover:bg-gray-50 transition-colors cursor-pointer group disabled:opacity-50"
                            >
                                <div className="flex items-center justify-center p-0.5 bg-[var(--bg-green-primary)] rounded-full text-[var(--text-black)]">
                                    <UserIcon size={12} strokeWidth={3} />
                                </div>
                                <span className="text-[var(--text-black)] font-inter font-bold text-[12px] md:text-[14px] capitalize">
                                    {currentAccountType}
                                </span>
                                {isChangingAccount ? (
                                    <Loader2 size={14} className="animate-spin text-[var(--text-black)]" />
                                ) : (
                                    <ChevronDown size={14} className={`text-[var(--text-black)] transition-transform duration-300 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                                )}
                            </button>

                            {isAccountDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsAccountDropdownOpen(false)}
                                    />
                                    <div className="absolute top-full left-0 lg:left-auto lg:right-0 mt-2 w-40 bg-[var(--bg-white)] rounded-xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2">
                                        {ACCOUNT_TYPES.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => handleAccountChange(type.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold font-inter transition-all hover:bg-gray-100 ${currentAccountType === type.id
                                                    ? 'text-[var(--bg-green-header)] bg-green-50/30'
                                                    : 'text-[var(--text-black)]'
                                                    }`}
                                            >
                                                <div className={`p-1 rounded-md ${currentAccountType === type.id ? 'bg-[var(--bg-green-primary)]' : 'bg-gray-100'}`}>
                                                    <UserIcon size={14} strokeWidth={currentAccountType === type.id ? 3 : 2} />
                                                </div>
                                                <span>{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Balance */}
                    <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-1.5 bg-[var(--bg-white)] rounded-full font-inter font-bold text-[12px] md:text-[14px] flex-shrink-0">
                        <span className="text-[var(--text-black)] whitespace-nowrap flex items-center gap-1.5">
                            <span className="hidden sm:inline">Balance:</span>
                            <SelectedIcon size={14} className="mt-0.5" />
                            {isConverting ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                convertedWalletAmount.toFixed(2)
                            )}
                        </span>
                    </div>

                    {/* Currency Selector (USD) */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 bg-[var(--bg-white)] rounded-full hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center justify-center p-0.5 bg-[var(--bg-green-primary)] rounded-full text-[var(--text-black)]">
                                <SelectedIcon size={12} strokeWidth={3} />
                            </div>
                            <span className="text-[var(--text-black)] font-inter font-bold text-[12px] md:text-[14px]">
                                {selectedCurrency.code}
                            </span>
                            <ChevronDown size={14} className={`text-[var(--text-black)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-36 bg-[var(--bg-white)] rounded-xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2">
                                    {currencies.map((curr) => {
                                        const Icon = curr.icon;
                                        return (
                                            <button
                                                key={curr.code}
                                                onClick={() => {
                                                    setSelectedCurrency(curr);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold font-inter transition-all hover:bg-gray-100 ${selectedCurrency.code === curr.code
                                                    ? 'text-[var(--bg-green-header)] bg-green-50/30'
                                                    : 'text-[var(--text-black)]'
                                                    }`}
                                            >
                                                <div className={`p-1 rounded-md ${selectedCurrency.code === curr.code ? 'bg-[var(--bg-green-primary)]' : 'bg-gray-100'}`}>
                                                    <Icon size={14} strokeWidth={selectedCurrency.code === curr.code ? 3 : 2} />
                                                </div>
                                                <span>{curr.code}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
