'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {LayoutGrid,Bitcoin,History,MessageCircleQuestion,ExternalLink,Ticket,LifeBuoy,Users, LineChart} from 'lucide-react';

const sidebarLinks = [
    { id: 'dashboard', label: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { id: 'payouts', label: 'Payouts', href: '/dashboard/payouts', icon: Bitcoin },
    { id: 'transaction-history', label: 'Transaction History', href: '/dashboard/transactions', icon: History },
    { id: 'bets', label: 'All Bets', href: '/dashboard/bets', icon: Ticket },
    { id: 'users', label: 'Users', href: '/dashboard/users', icon: Users },
    { id: 'leaderboard', label: 'Leaderboard', href: '/dashboard/leaderboard', icon: LineChart },
    { id: 'faqs', label: 'FAQs', href: '/dashboard/faqs', icon: MessageCircleQuestion },
    { id: 'support', label: 'Support', href: '/dashboard/support', icon: LifeBuoy },
    // { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed top-0 left-0 w-[246px] h-screen bg-white border-r border-[#E2E8F0] flex flex-col py-6 overflow-y-auto no-scrollbar font-['Inter'] z-40">
            <div className="px-4 mb-6">
                <div className="flex items-center gap-2">
                    <Image
                        src="/images/logo.png"
                        alt="Stirling Picks"
                        width={50}
                        height={38}
                        className="object-contain"
                        priority
                    />
                    <span className="text-[16px] font-semibold tracking-[-0.15px]">StirlingPicks</span>
                </div>
            </div>
            <nav className="flex-1 px-3 flex flex-col gap-4">
                {sidebarLinks.map((link) => {
                    const isActive = link.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(link.href);

                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.id}
                            href={link.href}
                            className={`
                                w-[205px] h-[46px] flex items-center gap-3 px-3 rounded-lg transition-all duration-200 group
                                text-[14px] font-medium tracking-[-0.15px] leading-[100%] whitespace-nowrap
                                ${isActive
                                    ? 'bg-[#50F090] text-black'
                                    : 'text-[#1E293B] hover:bg-[rgba(27,89,248,0.1)] hover:text-[#1B59F8]'
                                }
                            `}
                        >
                            <Icon
                                className={`w-6 h-6 flex-shrink-0
                                    ${isActive
                                        ? 'text-black'
                                        : 'text-[#1E293B] group-hover:text-[#1B59F8]'
                                    }
                                `}
                                strokeWidth={isActive ? 2 : 1.5}
                            />
                            <span className="align-middle">
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-3 pt-2 border-t border-[#E2E8F0] mt-2">
                <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[205px] h-[46px] flex items-center gap-3 px-3 rounded-lg transition-all duration-200 group text-[#1E293B] hover:bg-[rgba(27,89,248,0.1)] hover:text-[#1B59F8] text-[14px] font-medium tracking-[-0.15px] leading-[100%] whitespace-nowrap"
                >
                    <ExternalLink
                        className="w-6 h-6 flex-shrink-0 text-[#1E293B] group-hover:text-[#1B59F8]"
                        strokeWidth={1.5}
                    />
                    <span className="align-middle">Go to Website</span>
                </Link>
            </div>
        </aside>
    );
}

