'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, History, HelpCircle, ChevronDown, LayoutDashboard, ShieldCheck, Ticket, Headset, Wallet } from 'lucide-react';

interface UserData {
    name: string;
    email: string;
    role?: number;
    isVerified?: boolean;
}

interface UserDropdownProps {
    user: UserData;
    logout: () => void;
}

export default function UserDropdown({ user, logout }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const menuItems = [
        ...(user.role === 0 ? [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ] : []),
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Transaction History', href: '/transactions-history', icon: History },
        { name: 'Bet History', href: '/bet-history', icon: Ticket },
        { name: 'Payout History', href: '/payout-history', icon: Wallet },
        { name: 'FAQ', href: '/faqs', icon: HelpCircle },
        { name: 'Support', href: '/support', icon: Headset },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 px-2 py-1.5 rounded-lg transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-[var(--bg-navy-secondary)] flex items-center justify-center text-white font-bold text-sm uppercase">
                    {user.name.charAt(0)}
                </div>
                <div className="hidden sm:flex items-center gap-1">
                    <span className="font-medium text-[14px]">
                        {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[var(--border-light)] py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="px-4 py-3 border-b border-[var(--border-light)] mb-1">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-[var(--text-dark)] truncate">{user.name}</p>
                            {user.isVerified && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20 shrink-0">
                                    <ShieldCheck size={10} strokeWidth={3} />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Verified</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-[var(--text-dark-secondary)] overflow-hidden text-ellipsis">{user.email}</p>
                    </div>

                    <div className="flex flex-col">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-dark)] hover:bg-[var(--bg-green-primary)]/10 hover:text-[var(--text-black)] transition-colors"
                            >
                                <item.icon size={16} className="text-[var(--text-dark-secondary)]" />
                                {item.name}
                            </Link>
                        ))}

                        <hr className="my-1 border-[var(--border-light)]" />

                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
