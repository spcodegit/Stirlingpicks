"use client";

import React from "react";

interface AccountToggleProps {
    activeTab: "standard" | "professional";
    onTabChange: (tab: "standard" | "professional") => void;
}

export default function AccountToggle({ activeTab, onTabChange }: AccountToggleProps) {
    return (
        <div className="flex items-center justify-between p-1 bg-[var(--bg-secondary)] border border-[var(--border-white)] rounded-[10px] w-[340px] h-[53px] mb-12">
            <button
                onClick={() => onTabChange("standard")}
                className={`flex-1 h-full font-inter font-semibold text-[16px] rounded-[8px] transition-all cursor-pointer flex items-center justify-center ${activeTab === "standard"
                    ? "bg-[var(--bg-white)] text-[var(--accent-blue)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
            >
                Standard
            </button>
            <button
                onClick={() => onTabChange("professional")}
                className={`flex-1 h-full font-inter font-semibold text-[16px] rounded-[8px] transition-all cursor-pointer flex items-center justify-center ${activeTab === "professional"
                    ? "bg-[var(--bg-white)] text-[var(--accent-blue)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
            >
                Professional
            </button>
        </div>
    );
}
