'use client';
import React from 'react';

export default function DashboardHeader() {

    return (
        <header className="h-[80px] bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-6">
                <h1 className="text-[24px] font-bold text-black tracking-tight font-inter">
                    Deposit Now
                </h1>
            </div>
        </header>
    );
}
