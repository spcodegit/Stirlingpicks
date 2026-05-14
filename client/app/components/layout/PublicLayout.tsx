'use client';
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Nav from '../web/Nav';
import HowItWorks from '../web/HowItWorks';
import TermsDropdown from '../web/TermsDropdown';
import TermsContent from '../web/TermsContent';
import Footer from './Footer';

interface PublicLayoutProps {
    children: React.ReactNode;
    isSubPage?: boolean;
}

export default function PublicLayout({ children, isSubPage = false }: PublicLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className={`${isSubPage ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col bg-[var(--bg-green-primary)]`}>
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className='h-0.5 bg-[var(--bg-yellow-primary)] w-full'></div>
            <div className='h-0.5 bg-[var(--bg-white)] w-full'></div>
            <div className='h-0.5 bg-[var(--bg-yellow-primary)] w-full'></div>

            <div className={`flex flex-1 relative ${isSubPage ? 'overflow-hidden' : ''}`}>
                {/* Sidebar - Desktop and Mobile Overlay */}
                <div
                    className={`
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                        lg:translate-x-0 
                        fixed lg:sticky 
                        top-0 lg:top-[48px]
                        z-50 lg:z-30 
                        transition-transform duration-300 ease-in-out
                        h-screen lg:h-[calc(100vh-48px)]
                    `}
                >
                    <Sidebar />
                </div>

                {/* Mobile Overlay Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-[var(--overlay-dark)] z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <Nav />
                    <main className={`flex-1 flex flex-col ${isSubPage ? 'overflow-y-auto no-scrollbar' : ''}`}>
                        {children}
                    </main>
                </div>
            </div>

            {/* Common Footer Sections */}

        </div>
    );
}
