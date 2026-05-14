'use client';
import React, { useState } from 'react';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-dash-main-bg flex">
            <div className="hidden lg:block w-[246px] flex-shrink-0">
                <DashboardSidebar />
            </div>
            <div
                className={`
                    fixed inset-0 z-50 lg:hidden transition-opacity duration-300
                    ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
            >
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setIsSidebarOpen(false)}
                />

                {/* Sidebar Drawer */}
                <div
                    className={`
                        absolute inset-y-0 left-0 w-[240px] transform transition-transform duration-300
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <DashboardSidebar />
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute top-4 right-[-48px] p-2 bg-white rounded-md text-gray-600 lg:hidden"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <div className="lg:hidden flex items-center px-4 h-[60px] bg-white border-b border-dash-border">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold font-orbitron">STIRLING PICKS</span>
                </div>

                <DashboardHeader />

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
