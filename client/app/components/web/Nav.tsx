"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, DollarSign, PoundSterling, Euro, Banknote, Loader2, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { ACCOUNT_TYPES } from "../../context/constants";

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
                const response = await fetch(
                    `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd/${targetCode}.json`,
                    { cache: "no-store" }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch currency conversion rate");
                }

                const data = (await response.json()) as Record<string, unknown>;
                const rate = Number(data[targetCode]);

                if (!Number.isFinite(rate) || rate <= 0) {
                    throw new Error("Invalid conversion rate");
                }

                if (!isCancelled) {
                    setConversionRate(rate);
                }
            } catch {
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
                   

                    {/* Currency Selector */}
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

                    {/* Top Up */}
                    <Link
                        href="/account"
                        className="hover:opacity-80 transition-opacity font-inter font-bold text-[13px] md:text-[16px] text-[var(--text-primary)] whitespace-nowrap px-1"
                    >
                        Top up
                    </Link>
                    {/* Balance */}
                    <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-1.5 bg-[var(--bg-white)] rounded-full font-inter font-bold text-[13px] md:text-[16px] flex-shrink-0">
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
                     {/* Account Type Selector */}
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
                </div>
            </div>
        </nav>
    );
}
